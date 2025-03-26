// src/utils/timeSlots.js
export function generateTimeSlots(startHour = 9, endHour = 17, interval = 30) {
  const slots = [];
  let current = new Date();
  current.setHours(startHour, 0, 0, 0);
  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    const hours = current.getHours();
    const minutes = current.getMinutes();
    slots.push(formatTime(hours, minutes));
    current.setMinutes(current.getMinutes() + interval);
  }
  return slots;
}

function formatTime(hours, minutes) {
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 || 12;
  const minString = minutes.toString().padStart(2, '0');
  return `${twelveHour}:${minString} ${ampm}`;
}
