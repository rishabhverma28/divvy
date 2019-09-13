import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  // Set the error and data states for all the tasks
  const [dataTask1, setDataTask1] = useState("");
  const [dataTask2, setDataTask2] = useState("");
  const [dataTask3, setDataTask3] = useState("");
  const [error1, setError1] = useState(false);
  const [error2, setError2] = useState(false);
  const [error3, setError3] = useState(false);
  const [helpRequired, sethelpRequired] = useState(false);
  // Set the ref for the input box
  const inputEl = useRef(null);

  // The function to be called for Task 1
  const handleClickTask1 = () => {
    const inputVal = inputEl.current.value;
    if (inputVal === "") {
      // If the input box is empty and the button is clicked
      sethelpRequired(true);
    } else {
      // fetch the data
      fetch("/group/" + inputVal)
        .then(resp => {
          if (resp.ok) {
            return resp.json();
          } else {
            // error is true in the case when response is bad
            setError1(true);
          }
        })
        .then(data => {
          // If everything goes well, the response is set
          setDataTask1(data);
        });
      // Error and help text set to false
      setError1(false);
      sethelpRequired(false);
    }
  };

  // Function to be called for Task 2 or 3
  const handleClick = e => {
    const taskType = e.target.getAttribute("data-button-id");
    let task2 = true;
    taskType === "top_three" ? (task2 = true) : (task2 = false);
    fetch("/" + taskType)
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
      {/* Header */}
      <header className="App-header">
        <h1>Divvy</h1>
      </header>
      {/* Main section of the app */}
      <main className="tasks">
        <section className="tasks-section">
          <h2 className="tasks-section-heading">Task 1</h2>
          <input type="text" ref={inputEl} required />
          <button onClick={handleClickTask1}>
            Show me the Results for Task 1
          </button>
          {/* Show the section below only when the data for Task 1 is present */}
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
          {/* Set the help text to be true when empty input is passed */}
          {helpRequired ? (
            <div className="help">Please enter the station id</div>
          ) : null}
          {/* Set the error to be true for Task1 */}
          {error1 ? <div>There was an error fetching the data</div> : null}
        </section>
        <section className="tasks-section">
          <h2 className="tasks-section-heading">Task 2</h2>
          <button onClick={handleClick} data-button-id="top_three">
            Show me the Results for Task 2
          </button>
          {/* Show the section below only when the data for Task 2 is present */}
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
          {/* Set the error to be true for Task2 */}
          {error2 ? <div>There was an error fetching the data</div> : null}
        </section>
        <section className="tasks-section">
          <h2 className="tasks-section-heading">Task 3</h2>
          <button onClick={handleClick} data-button-id="bike_repairs">
            Show me the Results for Task 3
          </button>
          {/* Show the section below only when the data for Task 3 is present */}
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
          {/* Set the error to be true for Task3 */}
          {error3 ? <div>There was an error fetching the data</div> : null}
        </section>
      </main>
    </div>
  );
}

export default App;
