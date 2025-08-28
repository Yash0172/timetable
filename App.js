import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  // State variables
  const [teacher, setTeacher] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [yearSelect, setYearSelect] = useState('FY');
  const [subjectInput, setSubjectInput] = useState('');
  const [numberOfSlots, setNumberOfSlots] = useState(5);
  const [subjectsByYear, setSubjectsByYear] = useState({ FY: [], SY: [], TY: [] });
  const [timetableData, setTimetableData] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Initialize academic years dropdown
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(`${currentYear + i}-${currentYear + i + 1}`);
    }
    setAcademicYears(years);
    
    // Load teacher data if exists
    const savedTeacher = localStorage.getItem('currentTeacher');
    if (savedTeacher) {
      setTeacher(savedTeacher);
      loadTeacherData(savedTeacher);
    }
  }, []);

  // Save data when teacher changes
  useEffect(() => {
    if (teacher) {
      localStorage.setItem('currentTeacher', teacher);
      saveTeacherData();
    }
  }, [teacher, academicYear, semester, subjectsByYear, timetableData]);

  // Save teacher data to localStorage
  const saveTeacherData = () => {
    if (!teacher) return;
    
    const data = {
      teacher,
      academicYear,
      semester,
      subjects: subjectsByYear,
      timetable: timetableData
    };
    
    localStorage.setItem(`timetable_${teacher}`, JSON.stringify(data));
  };

  // Load teacher data from localStorage
  const loadTeacherData = (teacherName) => {
    const savedData = JSON.parse(localStorage.getItem(`timetable_${teacherName}`));
    if (!savedData) return;
    
    setAcademicYear(savedData.academicYear || '');
    setSemester(savedData.semester || '');
    setSubjectsByYear(savedData.subjects || { FY: [], SY: [], TY: [] });
    setTimetableData(savedData.timetable || []);
  };

  // Add a subject
  const addSubject = () => {
    if (!subjectInput.trim()) {
      alert("Please enter a subject name");
      return;
    }
    
    if (!subjectsByYear[yearSelect].includes(subjectInput)) {
      const updatedSubjects = { 
        ...subjectsByYear, 
        [yearSelect]: [...subjectsByYear[yearSelect], subjectInput] 
      };
      setSubjectsByYear(updatedSubjects);
      setSubjectInput('');
    }
  };

  // Clear all subjects
  const clearSubjects = () => {
    if (window.confirm("Clear all subjects for all years?")) {
      setSubjectsByYear({ FY: [], SY: [], TY: [] });
    }
  };

  // Create timetable inputs
  const createTimeSlots = () => {
    if (isNaN(numberOfSlots) || numberOfSlots < 1) {
      alert("Please enter a valid number of slots");
      return;
    }
    
    const newTimetableData = [];
    for (let i = 0; i < numberOfSlots; i++) {
      newTimetableData.push({
        timeStart: '',
        timeEnd: '',
        days: Array(6).fill().map(() => ({ year: '', subject: '', type: '' }))
      });
    }
    
    setTimetableData(newTimetableData);
  };

  // Update timetable data
  const updateTimetable = (index, dayIndex, field, value) => {
    const updatedData = [...timetableData];
    
    if (field === 'timeStart' || field === 'timeEnd') {
      updatedData[index][field] = value;
    } else {
      updatedData[index].days[dayIndex][field] = value;
    }
    
    setTimetableData(updatedData);
  };

  // Generate preview
  const generateTimetable = () => {
    saveTeacherData();
  };

  // Save as image
  const saveAsImage = () => {
    const element = document.getElementById("previewSection");
    html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true
    }).then(canvas => {
      canvas.toBlob(blob => {
        saveAs(blob, `timetable_${teacher || "staff"}.png`);
      });
    });
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm("Clear ALL data including timetable entries?")) {
      setTeacher('');
      setAcademicYear('');
      setSemester('');
      setSubjectsByYear({ FY: [], SY: [], TY: [] });
      setTimetableData([]);
      localStorage.removeItem('currentTeacher');
      if (teacher) {
        localStorage.removeItem(`timetable_${teacher}`);
      }
    }
  };

  return (
    <div className="App">
      <div className="logo">
        <img src="1000011832.png" alt="Logo" />
      </div>
      
      <div className="container">
        <h2>Staff Individual Time Table Generator</h2>
        
        {/* Teacher Details */}
        <div className="input-section">
          <h3>Teacher Details</h3>
          <div className="form">
            <label>
              Teacher: 
              <input 
                type="text" 
                value={teacher} 
                onChange={(e) => setTeacher(e.target.value)} 
                placeholder="Teacher Name" 
              />
            </label>
            <hr />
            <label>
              Academic Year: 
              <select 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="">Select Year (Optional)</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <hr />
            <label>
              Semester: 
              <select 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="">Select Semester (Optional)</option>
                <option value="Sem 1">Semester 1</option>
                <option value="Sem 2">Semester 2</option>
              </select>
            </label>
          </div>
        </div>
        
        {/* Subject Management */}
        <div className="input-section">
          <h3>Subject Management</h3>
          <div className="subject-controls">
            <label>
              Year: 
              <select 
                value={yearSelect} 
                onChange={(e) => setYearSelect(e.target.value)}
              >
                <option value="FY">First Year (FY)</option>
                <option value="SY">Second Year (SY)</option>
                <option value="TY">Third Year (TY)</option>
              </select>
            </label>
            <label>
              Subject: 
              <input 
                type="text" 
                value={subjectInput} 
                onChange={(e) => setSubjectInput(e.target.value)} 
                placeholder="Enter subject name" 
              />
            </label>
            <br/><br/><button onClick={addSubject}>Add Subject</button>
          </div>
        
          <div className="subject-list">
            <h4>
              Added Subjects 
              <button onClick={clearSubjects} className="delete">Clear All</button>
            </h4>
            <div id="subjectDisplay">
              {Object.entries(subjectsByYear).map(([year, subjects]) => (
                subjects.length > 0 && (
                  <div key={year}>
                    <strong>{year}:</strong> {subjects.join(", ")}
                  </div>
                )
              ))}
            </div>
          </div>
          <label>
            No. of Time Slots: 
            <input 
              type="number" 
              min="1" 
              value={numberOfSlots} 
              onChange={(e) => setNumberOfSlots(parseInt(e.target.value) || 1)} 
            />
          </label>
          <button className="cta-button" onClick={createTimeSlots}>
            Create Time Slots
          </button>
          <br></br>
        </div>
        
        {/* Timetable Editor */}
        <div className="input-section">
          <h3>Timetable Editor</h3>
          <table id="timetable">
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
              </tr>
            </thead>
            <tbody>
              {timetableData.map((slot, index) => (
                <tr key={index}>
                  <td>
                    <input 
                      type="time" 
                      value={slot.timeStart} 
                      onChange={(e) => updateTimetable(index, 0, 'timeStart', e.target.value)} 
                      required 
                    /> 
                    <span> to </span>
                    <input 
                      type="time" 
                      value={slot.timeEnd} 
                      onChange={(e) => updateTimetable(index, 0, 'timeEnd', e.target.value)} 
                      required 
                    />
                  </td>
                  {slot.days.map((day, dayIndex) => (
                    <td key={dayIndex}>
                      <select 
                        value={day.year} 
                        onChange={(e) => updateTimetable(index, dayIndex, 'year', e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Year</option>
                        <option value="FY">FY</option>
                        <option value="SY">SY</option>
                        <option value="TY">TY</option>
                      </select>
                      <select 
                        value={day.subject} 
                        onChange={(e) => updateTimetable(index, dayIndex, 'subject', e.target.value)}
                        required 
                        disabled={!day.year}
                      >
                        <option value="" disabled>Select Subject</option>
                        {subjectsByYear[day.year]?.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                        {(!subjectsByYear[day.year] || subjectsByYear[day.year].length === 0) && (
                          <option value="" disabled>No subjects available</option>
                        )}
                      </select>
                      <select 
                        value={day.type} 
                        onChange={(e) => updateTimetable(index, dayIndex, 'type', e.target.value)}
                        required
                        className="type"
                      >
                        <option value="" disabled>Select Type</option>
                        <option value="Theory">Theory</option>
                        <option value="Practical">Practical</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button id="generate" onClick={generateTimetable}>
            Generate Preview
          </button>
        </div>
        
        {/* Output Section */}
        <div className="output-section">
          <h3>Generated Timetable</h3>
          <div id="previewSection">
            <div id="teacherDetails">
              {(teacher || academicYear || semester) && (
                <div>
                  <strong>
                    {teacher && `Teacher: ${teacher}`}
                    {academicYear && ` | Academic Year: ${academicYear}`}
                    {semester && ` | Semester: ${semester}`}
                  </strong>
                </div>
              )}
            </div>
            <table id="previewTable">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Saturday</th>
                </tr>
              </thead>
              <tbody>
                {timetableData.map((slot, index) => (
                  <tr key={index}>
                    <td>
                      {slot.timeStart && slot.timeEnd 
                        ? `${slot.timeStart} to ${slot.timeEnd}` 
                        : ''}
                    </td>
                    {slot.days.map((day, dayIndex) => (
                      <td key={dayIndex}>
                        {[day.year, day.subject, day.type && `(${day.type})`]
                          .filter(Boolean)
                          .join(' ')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="action-buttons">
            <button id="saveimg" onClick={saveAsImage}>
              Save as Image
            </button>
            <button onClick={clearAllData} className="delete-all">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;