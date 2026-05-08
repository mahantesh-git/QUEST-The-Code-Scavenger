import { ObjectId } from 'mongodb';
import { getTeamsCollection, getReservePoolCollection, getQuestionsCollection } from './db';
import { findTeamById } from './team-service';
import { recordScoreChange } from './index';

export async function claimReserveRound(teamId: string, isByAdmin: boolean = false): Promise<{ ok: boolean; error?: string; question?: any }> {
  const team = await findTeamById(teamId);
  if (!team) return { ok: false, error: 'Team not found' };

  // Check if they already swapped (Admin bypasses this check)
  // Arena 2: allow up to 4 swaps total
  const swapsUsed = team.swapsUsed || 0;
  if (!isByAdmin && swapsUsed >= 4) {
    return { ok: false, error: 'Team has already used all 4 available Round Swaps' };
  }

  const currentRoundIndex = team.gameState.round;
  const reservePool = await getReservePoolCollection();

  const reserveQuestions = await reservePool.find({}).toArray();
  if (reserveQuestions.length === 0) {
    return { ok: false, error: 'Reserve pool is currently empty. Cannot swap.' };
  }

  // Collect the IDs of every reserve question this team has already received
  // across all previous swaps so we never hand the same question twice.
  const alreadyUsedIds = new Set(Object.values(team.swappedRounds || {}));

  // Prefer questions the team hasn't seen yet
  let eligibleQuestions = reserveQuestions.filter(
    q => !alreadyUsedIds.has(q._id.toString())
  );

  if (eligibleQuestions.length === 0) {
    // Entire pool has been exhausted for this team (e.g. pool has fewer questions
    // than the number of swaps allowed). Fall back to the full pool but log a
    // warning so admins know to add more reserve questions.
    console.warn(`[Swap] Team ${teamId} exhausted all unique reserve questions — falling back to full pool.`);
    eligibleQuestions = reserveQuestions;
  }

  const selectedReserve = eligibleQuestions[Math.floor(Math.random() * eligibleQuestions.length)];

  // Deduct points (Admin bypasses this penalty)
  if (!isByAdmin) {
    await recordScoreChange(team._id, -300, 'Burned Round Swap');
  } else {
    // Record audit trail
    await recordScoreChange(team._id, 0, 'Admin Forced Round Swap (No Penalty)');
  }

  // Update team swappedRounds
  const updatedSwappedRounds = { ...team.swappedRounds, [currentRoundIndex.toString()]: selectedReserve._id.toString() };
  
  const teams = await getTeamsCollection();
  await teams.updateOne(
    { _id: team._id },
    { 
      $set: { 
        swappedRounds: updatedSwappedRounds, 
        'gameState.stage': 'p1_solve',
        'gameState.handoff': null,
        // Reset the round timer from the swap moment so elapsed time and speed
        // bonuses are calculated correctly from when the new question is received.
        'gameState.currentRoundStartTime': new Date().toISOString(),
        updatedAt: new Date() 
      },
      $inc: { swapsUsed: 1 }
    }
  );


  return { ok: true, question: selectedReserve };
}

export async function getCurrentQuestionForTeam(teamId: string): Promise<any | null> {
  const team = await findTeamById(teamId);
  if (!team) return null;

  const currentRoundIndex = team.gameState.round;
  
  if (team.swappedRounds && team.swappedRounds[currentRoundIndex.toString()]) {
    const reserveId = team.swappedRounds[currentRoundIndex.toString()];
    const reservePool = await getReservePoolCollection();
    const reserveQuestion = await reservePool.findOne({ _id: new ObjectId(reserveId) });
    if (reserveQuestion) {
      // Strip the reserve question's own stored 'round' field (e.g., 11–18)
      // and replace it with the actual current game round to prevent the
      // out-of-range round number leaking into the frontend display.
      const { round: _discarded, ...safeReserveDoc } = reserveQuestion as any;
      return { ...safeReserveDoc, round: currentRoundIndex + 1 };
    }
  }

  const questions = await getQuestionsCollection();
  return questions.findOne({ round: currentRoundIndex + 1 });
}
