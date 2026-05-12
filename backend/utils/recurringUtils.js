const normalizeDate = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addFrequency = (date, frequency) => {
  const nextDate = new Date(date);

  if (frequency === 'Weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  }

  if (frequency === 'Monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate;
  }

  nextDate.setFullYear(nextDate.getFullYear() + 1);
  return nextDate;
};

const getFirstRunDate = (startDateInput, frequency) => {
  const now = normalizeDate(new Date());
  let runDate = normalizeDate(startDateInput);

  while (runDate < now) {
    runDate = addFrequency(runDate, frequency);
  }

  return runDate;
};

module.exports = {
  addFrequency,
  getFirstRunDate,
  normalizeDate,
};
