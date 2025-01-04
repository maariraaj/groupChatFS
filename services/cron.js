const { CronJob } = require('cron');
const { Op } = require('sequelize');
const Chat = require('../models/chat');
const ArchivedChat = require('../models/archivedChat');

exports.job = new CronJob(
  '0 0 * * *',
  async function () {
    console.log(`Cron Job Started: Archiving chats older than 10 days at ${new Date()}`);
    await archiveChatsOlderThanTenDays();
  },
  null,
  false,
  'Asia/Kolkata'
);

async function archiveChatsOlderThanTenDays() {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const recordsToArchive = await Chat.findAll({
      where: {
        date_time: {
          [Op.lt]: tenDaysAgo,
        },
      },
    });

    if (recordsToArchive.length === 0) {
      console.log('No old records to archive.');
      return;
    }

    const archivedRecords = recordsToArchive.map((record) => ({
      id: record.id,
      message: record.message,
      date_time: record.date_time,
      isImage: record.isImage,
      UserId: record.userId,
      GroupId: record.groupId,
    }));

    await ArchivedChat.bulkCreate(archivedRecords);
    await Chat.destroy({
      where: {
        id: recordsToArchive.map((record) => record.id),
      },
    });

    console.log('Old records archived successfully at', new Date());
  } catch (error) {
    console.error('Error archiving old records:', { error, time: new Date() });
  }
}