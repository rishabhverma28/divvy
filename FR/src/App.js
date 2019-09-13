import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [dataTask1, setDataTask1] = useState("");
  const [dataTask2, setDataTask2] = useState("");
  const [dataTask3, setDataTask3] = useState("");
  const [error1, setError1] = useState(false);
  const [error2, setError2] = useState(false);
  const [error3, setError3] = useState(false);
  const [helpRequired, sethelpRequired] = useState(false);
  const inputEl = useRef(null);

  const handleClickTask1 = () => {
    const inputVal = inputEl.current.value;
    if (inputVal === "") {
      sethelpRequired(true);
    } else {
      fetch("/group/" + inputVal)
        .then(resp => {
          if (resp.ok) {
            return resp.json();
          } else {
            setError1(true);
          }
        })
        .then(data => {
          setDataTask1(data);
        });
      setError1(false);
      sethelpRequired(false);
    }
  };

  const handleClick = e => {
    const link = e.target.getAttribute("data-button-id");
    let task2 = true;
    link === "top_three" ? (task2 = true) : (task2 = false);
    fetch("/" + link)
      .then(resp => {
        if (resp.ok) {
          return resp.json();
        } else {
          task2 ? setError2(true) : setError3(true);
        }
      })
      .then(data => {
        task2 ? setDataTask2(data) : setDataTask3(data);
      });
    setError2(false);
    setError3(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Divvy</h1>
      </header>
      <main className="tasks">
        <section className="tasks-section">
          <h2 className="tasks-section-heading">Task 1</h2>
          <input type="text" ref={inputEl} required />
          <button onClick={handleClickTask1} data-button-id="top_three">
            Show me the Results for Task 1
          </button>
          {dataTask1 && (
            <>
              <div className="tasks-section-content">
                <b>Most Common Destination: </b>
                <span>{dataTask1.common_destination}</span>
              </div>
              <div className="tasks-section-content">
                <b>Prevelant age group of users: </b>
                <span>{dataTask1.prev_age_group}</span>
              </div>
              <div className="tasks-section-content">
                <b>Total Revenue: </b>
                <span>{dataTask1.total_revenue}</span>
              </div>
              <div className="tasks-section-content">
                <b>Trend Line</b>
                <table>
                  <thead>
                    <tr>
                      <th>Start Time</th>
                      <th>Trip Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataTask1.data_points.map((val, i) => {
                      return (
                        <tr key={i}>
                          <td>{val.start_time}</td>
                          <td>{val.tripduration}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {helpRequired ? (
            <div className="help">Please enter the station id</div>
          ) : null}
          {error1 ? <div>There was an error fetching the data</div> : null}
        </section>
        <section className="tasks-section">
          <h2 className="tasks-section-heading">Task 2</h2>
          <button onClick={handleClick} data-button-id="top_three">
            Show me the Results for Task 2
          </button>
          {dataTask2 && (
            <div className="tasks-section-content">
              {dataTask2.data.map((val, index) => {
                return (
                  <div key={index}>
                    <b>{val.from_station_name}</b> ($ {val.total_amount})
                  </div>
                );
              })}
            </div>
          )}
          {error2 ? <div>There was an error fetching the data</div> : null}
        </section>
        <section className="tasks-section">
          <h2 className="tasks-section-heading">Task 3</h2>
          <button onClick={handleClick} data-button-id="bike_repairs">
            Show me the Results for Task 3
          </button>
          {dataTask3 && (
            <div className="tasks-section-content">
              <b>The following bikes need repair</b>
              <ol>
                {dataTask3.bike_repairs_needed.map((val, index) => {
                  return <li key={index}>{val}</li>;
                })}
              </ol>
            </div>
          )}
          {error3 ? <div>There was an error fetching the data</div> : null}
        </section>
      </main>
    </div>
  );
}

export default App;
