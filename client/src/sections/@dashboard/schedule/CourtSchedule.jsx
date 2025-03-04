// import { ScheduleMeeting } from 'react-schedule-meeting';
import { useEffect, useState, useCallback } from 'react';
import CalendarWeek from 'rt-event-calendar';
import { format, addDays, subDays } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useParams, useNavigate, Link as RouterLink, } from 'react-router-dom';
import { Typography, Button, Breadcrumbs, Link } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { apiUrl, routes, methods } from '../../../constants';
import toast from 'react-hot-toast';



const CourtSchedule = () => {
  
  /////////////////////init variable///////////////////
  // const { user } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const courtName = searchParams.get("courtName");
  console.log(courtName)
  const user = {
    email: "minhlvhhe163657@fpt.edu.vn",
    phone: "0941998256",
    name: "milvh",
  };
  const orderData = {
    email: user.email,
    phone: user.phone,
    name: user.name,
    courtId: id,
    courtName: courtName,
    price: 10000
    // price: 150000
  };
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workingTime] = useState([0, 24]);
  const [weekStart] = useState(true);
  const [daysOff] = useState([]);
  const [weekDays] = useState({
    0: "Mon",
    1: "Tue",
    2: "Wed",
    3: "Thu",
    4: "Fri",
    5: "Sat",
    6: "Sun",
  });

  const [busyHours, setBusyHours] = useState({
    0: [3, 4, 10],
    1: [3, 4],
    2: [3, 4],
    3: [3, 4],
    4: [3, 4],
    5: [3, 4, 14],
    6: [3, 4, 14],
  });

  ///////////////////handle///////////////////

  const handleClickEvent = useCallback((clickedDay, clickedHour) => {
    // alert(`Clicked ${clickedHour} in ${weekDays[clickedDay]}`);

    setBusyHours((prevBusyHours) => ({
      ...prevBusyHours,
      [clickedDay]: [...(prevBusyHours[clickedDay] || []), clickedHour],
    }));

    axios
      .post(apiUrl(routes.PAY, methods.CREATE_PAYMENT_LINK), orderData)
      .then((response) => {
        console.log("123")
        console.log(response.data.link)
        window.location.href = response.data.link;
      })
      .catch((response) => {
        console.error('Error create payment link:', response.response.data.message);
        toast.error(`Failed: ${response.response.data.message} to create link`);
      });
  }, []);


  const backToCourtDetailPage = () => {
    navigate(`/courts/${id}`);
  };

  return (
    
    <div>
      <Helmet>
        <title> - Booking Schedule</title>
      </Helmet>

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/courts">
          Courts
        </Link>
        <Typography color="text.primary">Schedule</Typography>
      </Breadcrumbs>

      <Button variant="outlined" color="primary" onClick={backToCourtDetailPage} sx={{ mb: 2 }}>
        Back to Courts Details
      </Button>
      {/* Nút chuyển ngày và tiêu đề */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setCurrentDate(subDays(currentDate, 1))}>← Previous</button>
          <h2>{format(currentDate, 'cccc, LLLL do')}</h2>
        <button onClick={() => setCurrentDate(addDays(currentDate, 1))}>Next →</button>
      </div>
      <CalendarWeek
        weekDays={weekDays}
        workingTime={workingTime}
        weekStart={weekStart}
        busyHours={busyHours}
        daysOff={daysOff}
        onClick={handleClickEvent}
      />
  </div>
  );
}

export default CourtSchedule

// const CourtSchedule = () => {

//     const availableTimeslots = [0, 1, 2, 3, 4, 5].map((id) => {
//         console.log("check:")
//         return {
//           id,
//           startTime: new Date(new Date(new Date().setDate(new Date().getDate() + id)).setHours(9, 0, 0, 0)),
//           endTime: new Date(new Date(new Date().setDate(new Date().getDate() + id)).setHours(17, 0, 0, 0)),
//         };
//       });

//     const handleSelect = (selectedStartTime) => {
//       console.log("Thời gian đã chọn:", selectedStartTime);
//     };



//     return (
//         <div>
//         <h2>Chọn thời gian họp</h2>
//         <ScheduleMeeting
//           borderRadius={10}
//           startTimeListStyle="scroll-list"
//           primaryColor="#3f5b85"
//           eventDurationInMinutes={30}
//           availableTimeslots={availableTimeslots}
//           onStartTimeSelect={handleSelect}
//         />
//         <h3>Lịch đã chọn:</h3>
//           <ul>
//             {selectedMeetings.map((time, index) => (
//               <li key={index}>{time.toLocaleString()}</li>
//             ))}
//           </ul>
//       </div>
//     );
// }

// export default CourtSchedule




