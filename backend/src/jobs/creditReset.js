import cron from 'node-cron';
import { CreditService } from '../services/CreditService.js';

/**
 * Monthly Credit Reset Cron Job
 * Runs at midnight every day to reset credits for users whose
 * billing anniversary is today.
 */

let isRunning = false;

export function startCreditResetJob() {
  // Schedule: Run at 00:00 every day
  // Format: 'minute hour day-of-month month day-of-week'
  const job = cron.schedule('0 0 * * *', async () => {
    if (isRunning) {
      console.log('[CreditReset] Previous job still running, skipping...');
      return;
    }

    isRunning = true;
    console.log('[CreditReset] Starting monthly credit reset job...');

    try {
      const startTime = Date.now();
      
      // Get all users whose anniversary is today
      const usersToReset = await CreditService.getUsersForMonthlyReset();
      
      if (usersToReset.length === 0) {
        console.log('[CreditReset] No users to reset today');
        isRunning = false;
        return;
      }

      console.log(`[CreditReset] Found ${usersToReset.length} users to reset`);

      let successCount = 0;
      let failCount = 0;
      let totalCreditsDistributed = 0;
      const errors = [];

      // Process each user
      for (const user of usersToReset) {
        try {
          const newBalance = await CreditService.resetMonthlyCredits(user.id);
          successCount++;
          totalCreditsDistributed += newBalance;
          
          console.log(`[CreditReset] Reset credits for user ${user.id}: ${newBalance} credits`);
          
          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          failCount++;
          errors.push({ userId: user.id, error: error.message });
          console.error(`[CreditReset] Failed to reset credits for user ${user.id}:`, error.message);
        }
      }

      const duration = Date.now() - startTime;

      // Log summary
      console.log('========================================');
      console.log('[CreditReset] Monthly Reset Complete');
      console.log('========================================');
      console.log(`Users reset: ${successCount}`);
      console.log(`Failed: ${failCount}`);
      console.log(`Total credits distributed: ${totalCreditsDistributed}`);
      console.log(`Duration: ${duration}ms`);
      
      if (errors.length > 0) {
        console.log('Errors:', errors);
      }
      console.log('========================================');

    } catch (error) {
      console.error('[CreditReset] Job failed:', error);
    } finally {
      isRunning = false;
    }
  }, {
    scheduled: true,
    timezone: 'UTC', // Use UTC for consistency
  });

  console.log('[CreditReset] Monthly credit reset job scheduled (runs daily at 00:00 UTC)');
  
  return job;
}

/**
 * Manual trigger for testing
 */
export async function triggerCreditResetManually() {
  console.log('[CreditReset] Manual trigger initiated...');
  
  try {
    const usersToReset = await CreditService.getUsersForMonthlyReset();
    console.log(`[CreditReset] Found ${usersToReset.length} users to reset`);
    
    for (const user of usersToReset.slice(0, 5)) { // Limit to 5 for testing
      try {
        const newBalance = await CreditService.resetMonthlyCredits(user.id);
        console.log(`[CreditReset] ✓ User ${user.id}: ${newBalance} credits`);
      } catch (error) {
        console.error(`[CreditReset] ✗ User ${user.id}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('[CreditReset] Manual reset failed:', error);
  }
}

export default { startCreditResetJob, triggerCreditResetManually };
