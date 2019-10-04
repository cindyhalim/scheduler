import { useEffect, useReducer } from "react";
import axios from "axios";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const SET_DAYS = "SET_DAYS";
const SET_NEW_INTERVIEW = "SET_NEW_INTERVIEW";
const DELETE_INTERVIEW = "DELETE_INTERVIEW";
const SET_REMAININGSPOTS = "SET_REMAININGSPOTS";

function reducer(state, action) {
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
      return {
        ...state,
        appointments: action.appointments
      };
    case SET_DAYS:
      return {
        ...state,
        days: action.days
      };
    case SET_REMAININGSPOTS:
      return {
        ...state,
        days: action.days
      };
    case SET_NEW_INTERVIEW: {
      const appointment = {
        ...state.appointments[action.eventData.id],
        interview: { ...action.eventData.interview }
      };

      const appointments = {
        ...state.appointments,
        [action.eventData.id]: appointment
      };

      return { ...state, appointments: appointments };
    }
    case DELETE_INTERVIEW: {
      const appointment = {
        ...state.appointments[action.eventData.id],
        interview: null
      };

      const appointments = {
        ...state.appointments,
        [action.eventData.id]: appointment
      };

      console.log("state in reducer", state);
      return { ...state, appointments: appointments };
    }

    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}

function updateObjectInArray(array, action) {
  return array.map((item, index) => {
    if (index !== action.index) {
      // This isn't the item we care about - keep it as-is
      return item;
    }

    // Otherwise, this is the one we want - return an updated value
    return {
      ...item,
      spots: action.item
    };
  });
}

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  console.log(state);
  const setDay = day => dispatch({ type: SET_DAY, value: day });
  // const setDays = days => setState(prev => ({ ...prev, days }));

  useEffect(() => {
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ])
      .then(all => {
        dispatch({
          type: SET_APPLICATION_DATA,
          days: all[0].data,
          appointments: all[1].data,
          interviewers: all[2].data
        });
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    const wss = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    wss.onopen = function(event) {
      wss.send("ping");
      wss.onmessage = function(event) {
        const eventData = JSON.parse(event.data);
        if (eventData.type === "SET_INTERVIEW") {
          if (eventData.interview !== null) {
            dispatch({ type: SET_NEW_INTERVIEW, eventData });
            axios
              .get(`/api/days`)
              .then(res => dispatch({ type: SET_DAYS, days: res.data }));
          } else {
            dispatch({ type: DELETE_INTERVIEW, eventData });
            axios
              .get(`/api/days`)
              .then(res => dispatch({ type: SET_DAYS, days: res.data }));
          }

          console.log("state", state);
        }
      };
    };
  }, []);

  function bookInterview(id, interview) {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    let dayID;
    function getDayID(id) {
      state.days.forEach((element, index) => {
        if (element.appointments.includes(id)) {
          dayID = index;
          return index;
        }
      });
    }
    getDayID(id);

    let days = updateObjectInArray(state.days, {
      index: dayID,
      item: state.days[dayID].spots - 1
    });
    dispatch({ type: SET_REMAININGSPOTS, days });

    return axios
      .put(`/api/appointments/${id}`, { interview })
      .then(() => dispatch({ type: SET_INTERVIEW, appointments }));
    // .then(() => axios.get(`/api/days`))
    // .then(res => dispatch({ type: SET_DAYS, days: res.data }));
  }

  function cancelInterview(id) {
    const appointment = {
      ...state.appointments[id],
      interview: null
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    return axios
      .delete(`/api/appointments/${id}`)
      .then(() => dispatch({ type: SET_INTERVIEW, appointments }))
      .then(() => axios.get(`/api/days`))
      .then(res => dispatch({ type: SET_DAYS, days: res.data }));
  }

  return { state, setDay, bookInterview, cancelInterview };
}
