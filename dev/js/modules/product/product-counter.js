import moment from 'moment';
import 'moment-business-days';
window.moment = moment

window.productCounter = function () {
  return {
    estimatedArrival: null,
    hoursUntilCutOff: null,
    pickDays: [1, 2, 3, 4, 5, 6], // Mon - Saturday
    cutOffTimeUTC: '16:00',
    init() {
      this.estimatedArrival = (this.willPickToday() ? moment().businessAdd(1) : moment().businessAdd(2)).format('Do MMMM');
      this.hoursUntilCutOff = moment.duration(this.nextPickCutOff().diff(moment()) ).humanize(true);
    },
    willPickToday(){
      return this.pickDays.includes(moment().day()) && moment(moment(),'HH:mm:ss').isBefore(moment(this.cutOffTimeUTC, 'HH:mm:ss'))
    },
    nextPickCutOff() {
      return this.willPickToday() ? moment(this.cutOffTimeUTC, 'HH:mm') :  moment(this.cutOffTimeUTC, 'HH:mm').businessAdd(1);
    },
  }
}