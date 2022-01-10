import { daysInMonth } from './utils'
import HijriDate from './hijri-date'
import Lazy from 'lazy.js'

let HijriCalendar = (function () {

  var MIN_CALENDAR_YEAR = 1000, MAX_CALENDAR_YEAR = 3000;

  // public

  var hijriCalendar = function (year, month, iso8601) {
    this.year = year;
    this.month = month;
    this.iso8601 = iso8601 ? iso8601 : false;
  };

  hijriCalendar.prototype.getYear = function () {
    return this.year;
  };

  hijriCalendar.prototype.getMonth = function () {
    return this.month;
  };

  hijriCalendar.prototype.isISO = function () {
    return this.iso8601;
  };

  hijriCalendar.getMinYear = function () {
    return MIN_CALENDAR_YEAR;
  };

  hijriCalendar.getMaxYear = function () {
    return MAX_CALENDAR_YEAR;
  };

  // return day of week for the specified date
  hijriCalendar.prototype.dayOfWeek = function (date) {
    var hijriDate = new HijriDate(this.year, this.month, date),
      offset = this.iso8601 ? 0.5 : 1.5;
    return (hijriDate.toAJD() + offset) % 7;
  };

  // return array of days of this month and year
  hijriCalendar.prototype.days = function () {
    var self = this;
    return Lazy.generate(function (day) {
      var hijriDate = new HijriDate(self.year, self.month, day + 1),
        gregorianDate = hijriDate.toGregorian();
      return dayHash(hijriDate, gregorianDate);
    }, daysInMonth(this.year, this.month)).toArray();//.toArray();
  };

  // return array of weeks for this month and year
  hijriCalendar.prototype.weeks = function () {

    return Lazy([]).concat(
      this.previousDays(),
      this.days(),
      this.nextDays()
    ).chunk(7).toArray();
  };

  // return array of days from beginning of week until start of this month and year
  hijriCalendar.prototype.previousDays = function () {
    var previousMonth = this.previousMonth(),
      daysInPreviousMonth = daysInMonth(previousMonth.getYear(), previousMonth.getMonth()),
      dayAtStartOfMonth = this.dayOfWeek(1);

    if (this.month === 0 && this.year === MIN_CALENDAR_YEAR)
      return Lazy.repeat(null, 6 - dayAtStartOfMonth).toArray();

    return Lazy.generate(function (day) {
      var hijriDate = new HijriDate(
        previousMonth.getYear(),
        previousMonth.getMonth(),
        daysInPreviousMonth - dayAtStartOfMonth + day + 1
      ),
        gregorianDate = hijriDate.toGregorian();
      return dayHash(hijriDate, gregorianDate, true);
    }, dayAtStartOfMonth).toArray();
  };

  // return array of days from end of this month and year until end of the week
  hijriCalendar.prototype.nextDays = function () {
    var nextMonth = this.nextMonth(),
      dim = daysInMonth(this.year, this.month),
      dayAtEndOfMonth = this.dayOfWeek(dim);

    if (nextMonth.getYear() === this.year && nextMonth.getMonth() === this.month)
      return Lazy.repeat(null, 6 - dayAtEndOfMonth).toArray();

    return Lazy.generate(function (day) {
      var hijriDate = new HijriDate(
        nextMonth.getYear(),
        nextMonth.getMonth(),
        day + 1
      ),
        gregorianDate = hijriDate.toGregorian();
      return dayHash(hijriDate, gregorianDate, true);
    }, 6 - dayAtEndOfMonth).toArray();

    ///////
    var nextMonth = this.nextMonth(),
      dim = daysInMonth(this.year, this.month),
      dayAtEndOfMonth = this.dayOfWeek(daysInMonth);

    if (nextMonth.getYear() === this.year && nextMonth.getMonth() === this.month)
      return _.repeat(null, 6 - dayAtEndOfMonth).toArray();

    return _.create(function (day) {
      var hijriDate = new HijriDate(
        nextMonth.getYear(),
        nextMonth.getMonth(),
        day + 1
      ),
        gregorianDate = hijriDate.toGregorian();
      return dayHash(hijriDate, gregorianDate, true);
    }, 6 - dayAtEndOfMonth);//.toArray();
  };

  // return Hijri Calendar object for the previous month
  hijriCalendar.prototype.previousMonth = function () {
    var year = (this.month === 0 && this.year > MIN_CALENDAR_YEAR) ? (this.year - 1) : this.year,
      month;

    if (this.month === 0 && this.year === MIN_CALENDAR_YEAR)
      month = this.month;
    else if (this.month === 0)
      month = 11;
    else
      month = this.month - 1;

    return new hijriCalendar(year, month, this.iso8601);
  };

  // return Hijri Calendar object for the next month
  hijriCalendar.prototype.nextMonth = function () {
    var year = (this.month === 11 && this.year < MAX_CALENDAR_YEAR) ? (this.year + 1) : this.year,
      month;

    if (this.month === 11 && this.year === MAX_CALENDAR_YEAR)
      month = this.month;
    else if (this.month === 11)
      month = 0;
    else
      month = this.month + 1;

    return new hijriCalendar(year, month, this.iso8601);
  };

  // return Hijri Calendar object for the previous year
  hijriCalendar.prototype.previousYear = function () {
    var year = (this.year === MIN_CALENDAR_YEAR) ? MIN_CALENDAR_YEAR : (this.year - 1);
    return new hijriCalendar(year, this.month, this.iso8601);
  };

  // return Hijri Calendar object for the next year
  hijriCalendar.prototype.nextYear = function () {
    var year = (this.year === MAX_CALENDAR_YEAR) ? MAX_CALENDAR_YEAR : (this.year + 1);
    return new hijriCalendar(year, this.month, this.iso8601);
  };

  // private

  function dayHash(hijriDate, gregorianDate, isFiller) {
    // console.log('hijriDate.getYear()', hijriDate.getYear())
    return {
      hijri: {
        year: hijriDate.getYear(),
        month: hijriDate.getMonth(),
        date: hijriDate.getDate()
      },
      gregorian: {
        year: gregorianDate.getFullYear(),
        month: gregorianDate.getMonth(),
        date: gregorianDate.getDate()
      },
      ajd: hijriDate.toAJD(),
      filler: (isFiller) ? true : undefined
    };
  }

  return hijriCalendar;
})();

export default HijriCalendar;