// import { ScheduleMeeting } from 'react-schedule-meeting';
import { useEffect, useState, useCallback } from 'react';
import CalendarWeek from 'rt-event-calendar';
import { format, addDays, subDays, isBefore, addWeeks, subWeeks, parse, set, getMonth, addHours } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useParams, useNavigate, Link as RouterLink, } from 'react-router-dom';
import { Typography, Button, Breadcrumbs, Link } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { apiUrl, routes, methods } from '../../../constants';
import toast from 'react-hot-toast';



const CourtSchedule = () => {
  
  /////////////////////init variable///////////////////
  //Date variable
  // const today = format(new Date(), "dd/MM");
  const [today, setToday] = useState(new Date());
  const { user } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const courtName = searchParams.get("courtName");
  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");

  // const user = {
  //   id: "67beeeae8da067d693aecbab",
  //   email: "minhlvhhe163657@fpt.edu.vn",
  //   phone: "0941998256",
  //   name: "milvh",
  // };

  const orderData = {
    email: user.email,
    phone: user.phone,
    name: user.name,
    userId: user._id,
    courtId: id,
    courtName: courtName,
    price: 5000,
    timeRental: null,
    endTime: ""
    // price: 150000
  };
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workingTime, setWorkingTime] = useState([0, 24]);
  // const [weekStart, setWeekStart] = useState(true);
  const weekStart = true
  const [daysOff] = useState([]);
  const [weekDays, setWeekDays] = useState({});

  const [busyHours, setBusyHours] = useState({
    0: [3, 4, 10],
    1: [3, 4],
    2: [3, 4],
    3: [3, 4],
    4: [3, 4],
    5: [3, 4, 14],
    6: [3, 4, 14],
  });

  ///////////////////handle Axios///////////////////
  const updateBillByOrderCode = () => {

    axios
      .put(apiUrl(routes.BILL, methods.PUT_BY, orderCode), orderData)
      .then((response) => {
        console.log("123")
        console.log(response.data)
        // window.location.href = response.data.link;
      })
      .catch((response) => {
        console.error('Error create payment link:', response.response.data.message);
        toast.error(`Failed: ${response.response.data.message} to create link`);
      });

  }

  const getAllBillByCourtIdAndDate = (weekDays) => {

    axios
      .get(apiUrl(routes.BILL, methods.GET_ALL_BY_DATE, id))
      .then((response) => {
        console.log("123")
        console.log(response.data)
        console.log("weekDays: ", weekDays)
        console.log("busyhours: ", busyHours)
        // const timeRentalList = 
        
        // const busyHours = {};



        // return response.data
      })
      .catch((response) => {
        console.log('Error:', response);
        console.error('Error:', response.response.data.error);
        toast.error(`Failed: ${response.response.data.message} to create link`);
      });

  }
  



  ///////////////////handle button///////////////////

  const handleClickEvent = (clickedDay, clickedHour) => {
    // alert(`Clicked ${clickedHour} in ${weekDays[clickedDay]}`);

    const dayBooking = weekDays[clickedDay]

    //check date 01/01
    let currentYear = currentDate.getFullYear(); // Lấy năm hiện tại kiểm tra (biến này dùng để công năm nếu qua ngày 1/1)
    if(getMonth(currentDate) === 11 && getMonth(dayBooking) === 0){
      currentYear = currentYear + 1
    }

    //data
    const parsedDate = parse(dayBooking, "EEEE - dd/MM", new Date());

    const timeBooking = set(parsedDate, {
      year: currentYear,
      hours: clickedHour,
    });
    const timeBookingFormat = format(timeBooking, "dd/MM/yyyy HH:mm:ss")
    const endTimeBooking = format(addHours(timeBooking, 1), "dd/MM/yyyy HH:mm:ss")
    console.log("abc4:", endTimeBooking)

    //set busy hour
    setBusyHours((prevBusyHours) => ({
      ...prevBusyHours,
      [clickedDay]: [...(prevBusyHours[clickedDay] || []), clickedHour],
    }));
    

    //set orderData
    orderData.timeRental = timeBookingFormat
    orderData.endTime = endTimeBooking
    console.log(orderData)






    axios
      .post(apiUrl(routes.PAY, methods.CREATE_PAYMENT_LINK), orderData)
      .then((response) => {
        console.log(response.data.link)
        window.location.href = response.data.link;
      })
      .catch((response) => {
        console.error('Error create payment link:', response.response.data.message);
        toast.error(`Failed: ${response.response.data.message} to create link`);
      });
  };


  
  
  useEffect(() => {
  

    ////////////////////////////handle logic set currentday of week////////////////////////////
    const object = {};
    const weekDays = [0, 1, 2, 3, 4, 5, 6].reduce(
      (accumulator, currentValue, currentIndex, array) => {
        if(today.getDay() < currentIndex){
          const dayPosition = currentIndex - today.getDay()
          const day = addDays(today, dayPosition)
          accumulator[currentIndex] = `${format(day, "EEE - dd/MM")}`;
        }else if(today.getDay() > currentIndex){
          const dayPosition = today.getDay() - currentIndex
          const day = subDays(today, dayPosition)
          accumulator[currentIndex] = `${format(day, "EEE - dd/MM")}`;
        }else{
          accumulator[currentIndex] = `${format(today, "EEE - dd/MM")}`;
        }
        return accumulator;
      },object
    );
    console.log(weekDays)
    setWeekDays(weekDays);

    const busyHours = {
      0: [3, 4, 10],
      1: [3, 4],
      2: [3, 4],
      3: [3, 4],
      4: [3, 4],
      5: [3, 4, 14],
      6: [3, 4, 14],
    }
    setBusyHours(busyHours)
    setCurrentDate(new Date())
    // console.log(busyHours)

    ////////////////////////////handle logic bill////////////////////////////

    // console.log("orderCode", orderCode)    
    // console.log("orderCode", courtName)    
    if(orderCode !== null && status === "PAID"){
      updateBillByOrderCode()
    }else if(orderCode !== null && status !== "PAID"){
      toast.error(`bạn đã huỷ đặt lịch`);
    }

    const bills = getAllBillByCourtIdAndDate(weekDays)

    console.log(bills)


  }, [today]);
  
  

  const handleChangeNextWeek =  () => {
    setToday(addWeeks(today, 1))
  };
  
  const handleChangeLastWeek = () => {
    setToday(subWeeks(today, 1))
  };


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
        <button onClick={handleChangeLastWeek}>← Previous</button>
          <h2>{format(currentDate, 'EEEE - dd/MM/yyyy')}</h2>
        <button onClick={handleChangeNextWeek}>Next →</button>
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




