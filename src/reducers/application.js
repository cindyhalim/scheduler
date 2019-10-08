const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
// const SET_DAYS = "SET_DAYS";
const UPDATE_INTERVIEW = "UPDATE_INTERVIEW";
// const SET_REMAININGSPOTS = "SET_REMAININGSPOTS";

function updateObjectInArray(array, action) {
  return array.map((item, index) => {
    if (index !== action.index) {
      return item;
    }
    return {
      ...item,
      spots: action.item
    };
  });
}

function getDayID(days, id) {
  let dayID;
  for (let day of days) {
    if (day.appointments.includes(id)) {
      dayID = day.id;
    }
  }
  return dayID;
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET_DAY:
      return { ...state, day: action.value };
    case SET_APPLICATION_DATA:
      return {
        ...state,
        days: action.days,
        appointments: action.appointments,
        interviewers: action.interviewers
      };
    case SET_INTERVIEW:
      // id = action.eventData.id || action.id;
      // console.log("my id", id);
      const appointment = {
        ...state.appointments[action.eventData.id],
        interview: action.eventData.interview
          ? { ...action.eventData.interview }
          : null
      };
      const appointments = {
        ...state.appointments,
        [action.eventData.id]: appointment
      };

      const id = action.eventData.id;
      let dayID;
      let days;

      if (appointments[id].interview) {
        dayID = getDayID(state.days, action.eventData.id);
        days = updateObjectInArray(state.days, {
          index: dayID - 1,
          item: state.days[dayID - 1].spots - 1
        });
      } else {
        dayID = getDayID(state.days, action.eventData.id);
        days = updateObjectInArray(state.days, {
          index: dayID - 1,
          item: state.days[dayID - 1].spots + 1
        });
      }

      return { ...state, appointments, days };
    // days
    // case UPDATE_INTERVIEW: {
    //   const appointment = {
    //     ...state.appointments[action.eventData.id],
    //     interview: action.eventData.interview
    //       ? { ...action.eventData.interview }
    //       : null
    //   };
    //   const appointments = {
    //     ...state.appointments,
    //     [action.eventData.id]: appointment
    //   };
    //   return { ...state, appointments: appointments };
    // }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
};

export {
  SET_DAY,
  SET_APPLICATION_DATA,
  SET_INTERVIEW,
  UPDATE_INTERVIEW,
  reducer
};
