import { useEffect, useReducer } from "react";
import axios from "axios";
import {
  SET_DAY,
  SET_APPLICATION_DATA,
  SET_INTERVIEW,
  reducer
} from "../reducers/application";

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

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
      wss.onmessage = function(event) {
        const eventData = JSON.parse(event.data);
        if (eventData.type === "SET_INTERVIEW") {
          dispatch({ type: SET_INTERVIEW, eventData });
        }
      };
    };
    return () => {
      wss.close();
    };
  }, []);

  function bookInterview(id, interview) {
    let eventData = { id, interview };
    return axios
      .put(`/api/appointments/${id}`, { interview })
      .then(() => dispatch({ type: SET_INTERVIEW, eventData }));
  }

  function cancelInterview(id) {
    let eventData = { id, interview: null };
    return axios
      .delete(`/api/appointments/${id}`)
      .then(() => dispatch({ type: SET_INTERVIEW, eventData }));
  }

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };
}
