/*******************************************************
 * SKYSEF 2026
 * Future Engineers Design & Build Challenge
 * Integrated GAS backend
 *******************************************************/

const SPREADSHEET_ID = '18S-0NPN9wRkqkno52NAhtV4lYAbXuL_5_Fn9YkH0Gy8';
const TEAM_COUNT = 35;

const SHEETS = {
  TEAMS: 'Teams',
  CHALLENGE1: 'Challenge1',
  CHALLENGE2: 'Challenge2',
  CHALLENGE3: 'Challenge3',
  DECORATION: 'Decoration'
};


function doGet(e) {
  const template = HtmlService.createTemplateFromFile('GAS_Index');
  template.initialId = e && e.parameter && e.parameter.id ? String(e.parameter.id) : '';
  template.initialMode = e && e.parameter && e.parameter.mode ? String(e.parameter.mode) : 'home';

  return template.evaluate()
    .setTitle('SKYSEF 2026 | Future Engineers Design & Build Challenge')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* -------------------- SETUP -------------------- */

function setupCompetitionSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  ensureSheet_(ss, SHEETS.TEAMS, ['Team No.', 'Team Name']);
  ensureSheet_(ss, SHEETS.CHALLENGE1, ['Timestamp', 'Team No.', 'Time', 'Status']);
  ensureSheet_(ss, SHEETS.CHALLENGE2, ['Timestamp', 'Team No.', 'Time', 'Status']);
  ensureSheet_(ss, SHEETS.CHALLENGE3, ['Timestamp', 'Team No.', 'Maximum Angle']);
  ensureSheet_(ss, SHEETS.DECORATION, ['Timestamp', 'Participant ID', 'Team No.']);

  const teamSheet = ss.getSheetByName(SHEETS.TEAMS);
  if (teamSheet.getLastRow() <= 1) {
    const rows = [];
    for (let i = 1; i <= TEAM_COUNT; i++) {
      rows.push([i, 'Team ' + String(i).padStart(2, '0')]);
    }
    teamSheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }

  Object.values(SHEETS).forEach(name => {
    const sh = ss.getSheetByName(name);
    sh.setFrozenRows(1);
    if (sh.getLastColumn() > 0) {
      sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold');
      sh.autoResizeColumns(1, sh.getLastColumn());
    }
  });

  return 'Setup completed.';
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
}

/* -------------------- TEAMS -------------------- */

function getTeams() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEETS.TEAMS);
  if (!sh) throw new Error('Teams sheet not found. Run setupCompetitionSheets().');

  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().map(r => ({
    teamNo: Number(r[0]),
    teamName: String(r[1] || ('Team ' + String(r[0]).padStart(2, '0')))
  }));
}

/* -------------------- SAVE RESULTS -------------------- */

function saveChallenge1(data) {
  validateTimed_(data);
  appendTimed_(SHEETS.CHALLENGE1, data);
  return { success: true, message: 'Challenge 1 result saved.' };
}

function saveChallenge2(data) {
  validateTimed_(data);
  appendTimed_(SHEETS.CHALLENGE2, data);
  return { success: true, message: 'Challenge 2 result saved.' };
}

function validateTimed_(data) {
  if (!data) throw new Error('No data received.');
  const team = Number(data.teamNo);
  if (!Number.isInteger(team) || team < 1 || team > TEAM_COUNT) throw new Error('Invalid team number.');
  if (!['ACHIEVED_GOAL', 'DIDNT_ACHIEVE_GOAL'].includes(String(data.status))) throw new Error('Invalid status.');
  const t = Number(data.time);
  if (!Number.isFinite(t) || t <= 0) throw new Error('Invalid time.');
}

function appendTimed_(sheetName, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(sheetName);
  sh.appendRow([
    new Date(),
    Number(data.teamNo),
    Number(data.time),
    String(data.status)
  ]);
  SpreadsheetApp.flush();
}

function saveChallenge3(data) {
  if (!data) throw new Error('No data received.');
  const team = Number(data.teamNo);
  const angle = Number(data.angle);

  if (!Number.isInteger(team) || team < 1 || team > TEAM_COUNT) throw new Error('Invalid team number.');
  if (!Number.isFinite(angle) || angle < 0 || angle > 90) throw new Error('Invalid angle.');

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ss.getSheetByName(SHEETS.CHALLENGE3).appendRow([new Date(), team, angle]);
  SpreadsheetApp.flush();

  return { success: true, message: 'Challenge 3 result saved.' };
}

/* -------------------- DECORATION VOTE -------------------- */

function checkDecorationVote(participantId) {
  participantId = String(participantId || '').trim();
  if (!participantId) return { voted: false };

  const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.DECORATION);
  if (sh.getLastRow() < 2) return { voted: false };

  const rows = sh.getRange(2, 2, sh.getLastRow() - 1, 2).getDisplayValues();
  for (const row of rows) {
    if (String(row[0]).trim() === participantId) {
      return { voted: true, teamNo: Number(row[1]) };
    }
  }
  return { voted: false };
}

function submitDecorationVote(data) {
  if (!data) throw new Error('No vote data received.');

  const participantId = String(data.participantId || '').trim();
  const teamNo = Number(data.teamNo);

  if (!participantId) return { success: false, code: 'NO_ID', message: 'Participant ID was not found.' };
  if (!Number.isInteger(teamNo) || teamNo < 1 || teamNo > TEAM_COUNT) {
    return { success: false, message: 'Please select a team.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName(SHEETS.DECORATION);

    if (sh.getLastRow() >= 2) {
      const ids = sh.getRange(2, 2, sh.getLastRow() - 1, 1)
        .getDisplayValues().flat().map(v => String(v).trim());

      if (ids.includes(participantId)) {
        return {
          success: false,
          code: 'ALREADY_VOTED',
          message: 'Your vote has already been submitted.'
        };
      }
    }

    sh.appendRow([new Date(), participantId, teamNo]);
    SpreadsheetApp.flush();
    return { success: true, message: 'Thank you for voting!' };

  } finally {
    lock.releaseLock();
  }
}

/* -------------------- LIVE RESULTS -------------------- */

function getCompetitionResults() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const teams = getTeams();

  const c1Latest = getLatestTimedResults_(ss.getSheetByName(SHEETS.CHALLENGE1));
  const c2Latest = getLatestTimedResults_(ss.getSheetByName(SHEETS.CHALLENGE2));
  const c3Latest = getLatestAngleResults_(ss.getSheetByName(SHEETS.CHALLENGE3));
  const voteCounts = getDecorationVoteCounts_(ss.getSheetByName(SHEETS.DECORATION));

  const c1Rank = rankTimedChallenge_(teams, c1Latest);
  const c2Rank = rankTimedChallenge_(teams, c2Latest);
  const c3Rank = rankAngleChallenge_(teams, c3Latest);

  const bestC1Time = getBestAchievedTime_(c1Latest);
  const bestC2Time = getBestAchievedTime_(c2Latest);
  const highestAngle = getHighestAchievedAngle_(c3Latest);
  const highestVotes = getHighestVoteCount_(voteCounts);

  const rows = teams.map(team => {
    const c1 = c1Rank.get(team.teamNo) || {};
    const c2 = c2Rank.get(team.teamNo) || {};
    const c3 = c3Rank.get(team.teamNo) || {};
    const decorationVotes = voteCounts.get(team.teamNo) || 0;

    const row = {
      teamNo: team.teamNo,
      teamName: team.teamName,
      challenge1: {
        time: c1.time ?? null,
        status: c1.status || '',
        rank: c1.rank ?? null,
        points: calculateTimedPoints_(c1, bestC1Time)
      },
      challenge2: {
        time: c2.time ?? null,
        status: c2.status || '',
        rank: c2.rank ?? null,
        points: calculateTimedPoints_(c2, bestC2Time)
      },
      challenge3: {
        angle: c3.angle ?? null,
        rank: c3.rank ?? null,
        points: calculateAnglePoints_(c3, highestAngle)
      },
      decorationVotes: decorationVotes,
      decorationPoints: calculateVotePoints_(decorationVotes, highestVotes)
    };

    row.totalPoints =
      row.challenge1.points +
      row.challenge2.points +
      row.challenge3.points +
      row.decorationPoints;

    return row;
  });

  rows.sort(compareOverall_);
  rows.forEach((row, index) => row.overallRank = index + 1);

  const latest = getLatestActivity_(ss, rows);

  return {
    generatedAt: Date.now(),
    teamCount: TEAM_COUNT,
    completed: {
      challenge1: c1Latest.size,
      challenge2: c2Latest.size,
      challenge3: c3Latest.size
    },
    latest: latest,
    overallRanking: rows,
    decorationRanking: [...rows].sort((a, b) =>
      (b.decorationVotes - a.decorationVotes) ||
      (a.teamNo - b.teamNo)
    )
  };
}

function compareOverall_(a, b) {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;

  const aw = countRank_(a, 1), bw = countRank_(b, 1);
  if (bw !== aw) return bw - aw;

  const as = countRank_(a, 2), bs = countRank_(b, 2);
  if (bs !== as) return bs - as;

  const aa = a.challenge3.angle ?? -1;
  const ba = b.challenge3.angle ?? -1;
  if (ba !== aa) return ba - aa;

  const a2 = a.challenge2.time ?? Number.POSITIVE_INFINITY;
  const b2 = b.challenge2.time ?? Number.POSITIVE_INFINITY;
  if (a2 !== b2) return a2 - b2;

  const a1 = a.challenge1.time ?? Number.POSITIVE_INFINITY;
  const b1 = b.challenge1.time ?? Number.POSITIVE_INFINITY;
  if (a1 !== b1) return a1 - b1;

  return a.teamNo - b.teamNo;
}

function countRank_(row, target) {
  let n = 0;
  if (row.challenge1.rank === target) n++;
  if (row.challenge2.rank === target) n++;
  if (row.challenge3.rank === target) n++;
  return n;
}

function getLatestTimedResults_(sh) {
  const result = new Map();
  if (!sh || sh.getLastRow() < 2) return result;

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  rows.forEach(r => {
    const teamNo = Number(r[1]);
    if (!teamNo) return;
    result.set(teamNo, {
      timestamp: r[0],
      time: r[2] === '' ? null : Number(r[2]),
      status: String(r[3] || '')
    });
  });
  return result;
}

function getLatestAngleResults_(sh) {
  const result = new Map();
  if (!sh || sh.getLastRow() < 2) return result;

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  rows.forEach(r => {
    const teamNo = Number(r[1]);
    if (!teamNo) return;
    result.set(teamNo, {
      timestamp: r[0],
      angle: Number(r[2])
    });
  });
  return result;
}

function getDecorationVoteCounts_(sh) {
  const result = new Map();
  if (!sh || sh.getLastRow() < 2) return result;

  const rows = sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues();
  rows.forEach(r => {
    const teamNo = Number(r[0]);
    if (!teamNo) return;
    result.set(teamNo, (result.get(teamNo) || 0) + 1);
  });
  return result;
}

function rankTimedChallenge_(teams, latest) {
  const finished = [];

  teams.forEach(team => {
    const d = latest.get(team.teamNo);
    if (d && d.status === 'ACHIEVED_GOAL' && Number.isFinite(d.time)) {
      finished.push({
        teamNo: team.teamNo,
        time: d.time,
        status: 'ACHIEVED_GOAL'
      });
    }
  });

  finished.sort((a, b) => a.time - b.time);

  const ranked = new Map();
  let prevValue = null;
  let prevRank = 0;

  finished.forEach((item, i) => {
    const rank = (prevValue !== null && item.time === prevValue) ? prevRank : i + 1;
    prevValue = item.time;
    prevRank = rank;

    ranked.set(item.teamNo, {
      time: item.time,
      status: 'ACHIEVED_GOAL',
      rank,
      points: 0
    });
  });

  teams.forEach(team => {
    if (ranked.has(team.teamNo)) return;
    const d = latest.get(team.teamNo);
    if (d) {
      ranked.set(team.teamNo, {
        time: null,
        status: d.status || '',
        rank: null,
        points: 0
      });
    }
  });

  return ranked;
}

function rankAngleChallenge_(teams, latest) {
  const entries = [];

  teams.forEach(team => {
    const d = latest.get(team.teamNo);
    if (d && Number.isFinite(d.angle)) {
      entries.push({ teamNo: team.teamNo, angle: d.angle });
    }
  });

  entries.sort((a, b) => b.angle - a.angle);

  const ranked = new Map();
  let prevValue = null;
  let prevRank = 0;

  entries.forEach((item, i) => {
    const rank = (prevValue !== null && item.angle === prevValue) ? prevRank : i + 1;
    prevValue = item.angle;
    prevRank = rank;
    ranked.set(item.teamNo, {
      angle: item.angle,
      rank,
      points: 0
    });
  });

  return ranked;
}

function getPointsForRank_(rank) {
  return 0;
}

function getBestAchievedTime_(latest) {
  const values = [];
  latest.forEach(data => {
    if (
      data.status === 'ACHIEVED_GOAL' &&
      Number.isFinite(data.time) &&
      data.time > 0
    ) {
      values.push(data.time);
    }
  });
  return values.length ? Math.min.apply(null, values) : null;
}

function getHighestAchievedAngle_(latest) {
  const values = [];
  latest.forEach(data => {
    if (Number.isFinite(data.angle) && data.angle > 0) {
      values.push(data.angle);
    }
  });
  return values.length ? Math.max.apply(null, values) : null;
}

function getHighestVoteCount_(voteCounts) {
  const values = Array.from(voteCounts.values());
  return values.length ? Math.max.apply(null, values) : 0;
}

function calculateTimedPoints_(result, bestTime) {
  if (
    !result ||
    result.status !== 'ACHIEVED_GOAL' ||
    !Number.isFinite(result.time) ||
    result.time <= 0 ||
    !Number.isFinite(bestTime) ||
    bestTime <= 0
  ) {
    return 0;
  }
  return roundPoint_(100 * bestTime / result.time);
}

function calculateAnglePoints_(result, highestAngle) {
  if (
    !result ||
    !Number.isFinite(result.angle) ||
    result.angle <= 0 ||
    !Number.isFinite(highestAngle) ||
    highestAngle <= 0
  ) {
    return 0;
  }
  return roundPoint_(100 * result.angle / highestAngle);
}

function calculateVotePoints_(votes, highestVotes) {
  if (
    !Number.isFinite(votes) ||
    votes <= 0 ||
    !Number.isFinite(highestVotes) ||
    highestVotes <= 0
  ) {
    return 0;
  }
  return roundPoint_(100 * votes / highestVotes);
}

function roundPoint_(value) {
  return Math.round(value * 10) / 10;
}

function getLatestActivity_(ss, allRows) {
  const items = [];

  [
    { key: 'challenge1', title: 'Balance Beam', name: SHEETS.CHALLENGE1, type: 'time' },
    { key: 'challenge2', title: 'Obstacle Course', name: SHEETS.CHALLENGE2, type: 'time' },
    { key: 'challenge3', title: 'Hill Climb', name: SHEETS.CHALLENGE3, type: 'angle' }
  ].forEach(cfg => {
    const sh = ss.getSheetByName(cfg.name);
    if (!sh || sh.getLastRow() < 2) return;

    const width = cfg.type === 'time' ? 4 : 3;
    const row = sh.getRange(sh.getLastRow(), 1, 1, width).getValues()[0];

    const teamNo = Number(row[1]);
    const team = allRows.find(r => r.teamNo === teamNo);
    if (!team) return;

    const timestampMs =
      row[0] instanceof Date
        ? row[0].getTime()
        : new Date(row[0]).getTime();

    if (cfg.type === 'time') {
      const status = String(row[3] || '');
      items.push({
        challenge: cfg.key,
        challengeTitle: cfg.title,
        timestampMs: Number.isFinite(timestampMs) ? timestampMs : 0,
        teamNo: teamNo,
        status: status,
        value: Number(row[2]),
        unit: 's',
        resultLabel:
          status === 'ACHIEVED_GOAL'
            ? 'Achieved Goal'
            : "Didn't achieve Goal",
        rank: team[cfg.key].rank,
        isLeader: team[cfg.key].rank === 1
      });
    } else {
      const angle = Number(row[2]);
      items.push({
        challenge: cfg.key,
        challengeTitle: cfg.title,
        timestampMs: Number.isFinite(timestampMs) ? timestampMs : 0,
        teamNo: teamNo,
        status: angle === 0 ? 'DIDNT_ACHIEVE_GOAL' : 'ACHIEVED_GOAL',
        value: angle,
        unit: '°',
        rank: team[cfg.key].rank,
        isLeader: team[cfg.key].rank === 1
      });
    }
  });

  items.sort((a, b) => b.timestampMs - a.timestampMs);
  return items[0] || null;
}
