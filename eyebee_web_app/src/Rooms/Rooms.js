import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import logoEyeBee from "../img/logo_eyebee_fondo_negrov2.jpg";
import { Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate } from "react-router-dom";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import NewRoom from "./NewRoom"
import axios from "axios"
import LinksRooms from "./LinksRooms";

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
        color: 'white',
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {
        backgroundColor: "#232222",
        color: 'white',
    },
    label: {
        color: 'white',
    },
    body: {
        color: 'white',
    },
}))(TableRow);


const theme = createTheme(adaptV4Theme({
    palette: {
        background: {
            default: "#000",
        },
        primary: {
            main: "#F29F39",
            contrastText: "#ffffff"
        },
        secondary: {
            main: "#fafafa",
            contrastText: "#8E8E8E"
        },
        action: {
            backgroundColor: "#aaaaaa",
            selected: "#2D2D2D"
        },
        lighterBg: {
            main: "#292929"
        }
    },
    actionBtn: {
        backgroundColor: "#212121",
        margin: "0.5em",
    },
    defaultIcon: {
        fontSize: "1.5em"
    },
    typography: {
        fontSize: "0.9em"
    }
}));


const useStyles = makeStyles(theme => ({

    mainBox: {
        display: "flex",
        flex: "2",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "#000"
    },
    large: {
        marginTop: "16px",
        marginRight: "5px"
    },
    container: {
        width: "100%",
        margin: "auto"
    },
    header: {
        width: "80%",
    },
    logoBox: {
        float: "left"
    },
    iconBox: {
        float: "right"
    },
    title: {
        color: "white"
    },
    roundedBtn: {
        textTransform: "none",
        borderRadius: "0.5em"
    },
    roomActionBtn: {
        margin: "0 1em",
        minWidth: "3em",
        fontSize: "0.8em"
    },
    link: {
        padding: 0,
        border: 0,
        background: "none",
        color: "white",
        font: "inherit",
        cursor: "pointer"
    }
}));

const lightButton = createTheme(adaptV4Theme({
    palette: {
        primary: {
            main: "#F29F39",
            contrastText: "#ffffff"

        },
        secondary: {
            main: "#fafafa",
            contrastText: "#212121"
        },
        text: {
            primary: "#fafafa",
            secondary: "#bdbdbd"
        },
        action: {
            disabled: "black",
            disabledBackground: "#292929"
        }
    }
}));


const Rooms = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const classes = useStyles();
    const [createRoom, setCreateRoom] = useState(false);
    const [showLinks, setShowLinks] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState();

    useEffect(() => {

        const auth = localStorage.getItem("auth");
        if (auth === false || auth === null)
            navigate('/admin/login');
        loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logout = () => {
        localStorage.setItem("auth", false);
        navigate('/admin/login');
    }

    const toogleCreateNewSubRoom = () => {
        setCreateRoom(!createRoom);
    }

    const toogleShowLinks = (roomId) => {
        setActiveRoom(roomId);
        setShowLinks(!showLinks);
    }

    const deleteRoom = (room_id) => {
        axios.delete("/api/v1/rooms/delete/" + room_id).then(result => {
            if (result.status === 200) {
                let index = rooms.map(r => r.room_id).indexOf(room_id);
                let newRooms = rooms.slice();
                newRooms.splice(index, 1);
                setRooms(newRooms);
            }
        }).catch(error => alert("Server error"));
    }

    const loadRooms = () => {
        axios.get("/api/v1/rooms/"+( location.state ? "filter/" + location.state.user.user_id:"")).then(result => {
            if (result.status === 200) {
                let roomsFromServer = result.data.data.map(r => {
                    let d = new Date(r.date);
                    let day = d.getDate()
                    let month = d.getMonth() + 1
                    let year = d.getFullYear();
                    let roomFromServer = { room_id: r.room_id, name: r.name, users: parseInt(r.usuarios), type: "Webinar", date: `${day}-${month}-${year}` };
                    return roomFromServer;
                });

                setRooms(roomsFromServer);
            }
        }).catch(error => alert("Server error"));
    }

    const createNewRoom = (roomName, roomMax) => {
        let date = new Date()
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear();

        const payload = { active: true, date: new Date(), name: roomName, type: "Webinar", usuarios: roomMax, room_uuid: "params", user_id: location.state.user.user_id }
        axios.post("/api/v1/rooms/", payload).then(result => {
            if (result.status === 201) {
                setRooms([...rooms, { room_id: result.data.data.room_id, name: roomName, users: roomMax, type: "Webinar", date: `${day}-${month}-${year}` }]);
            }
        }).catch(error => alert("Server error"));
    }

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>

                <div className={classes.mainBox}>
                    {createRoom && <NewRoom toogleCreateNewSubRoom={toogleCreateNewSubRoom} createSubRoom={createNewRoom}></NewRoom>}
                    {showLinks && <LinksRooms room_id={activeRoom} toogleShowLinks={toogleShowLinks}></LinksRooms>}

                    <div className={classes.header}>
                        <div className={classes.logoBox}>
                            <img style={{
                                height: 8 + "em",
                                width: "auto"
                            }} src={logoEyeBee} alt="Eyebee" />
                        </div>
                        <div className={classes.iconBox}>
                            <Avatar alt={location && location.state ? location.state.user.name : ""} src="/static/img/default-avatar.png" className={classes.large} />
                            <button type="button" className={classes.link} onClick={logout}>Logout</button>
                        </div>
                    </div>
                    <div className={classes.header}>
                        <div className={classes.logoBox}>
                            <h3 className={classes.title}>Rooms</h3>
                        </div>
                        <div className={classes.iconBox}>
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={lightButton} >
                                    <Button onClick={toogleCreateNewSubRoom} variant="contained"
                                        color="primary" className={`${classes.roundedBtn} ${classes.roomActionBtn}`}
                                    >New room</Button>
                                </ThemeProvider>
                            </StyledEngineProvider>
                        </div>
                    </div>

                    <div className={classes.header}>
                        <TableContainer className={classes.container} component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Name</StyledTableCell>
                                        <StyledTableCell align="right">Type</StyledTableCell>
                                        <StyledTableCell align="right">Users</StyledTableCell>
                                        <StyledTableCell align="right">Date</StyledTableCell>
                                        <StyledTableCell align="right"></StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rooms.map((room) => (
                                        <StyledTableRow key={room.name}>
                                            <StyledTableCell component="th" scope="row">
                                                {room.name}
                                            </StyledTableCell>
                                            <StyledTableCell align="right">{room.type}</StyledTableCell>
                                            <StyledTableCell align="right">{room.users}</StyledTableCell>
                                            <StyledTableCell align="right">{room.date}</StyledTableCell>
                                            <StyledTableCell align="right"> <StyledEngineProvider injectFirst>
                                                <ThemeProvider theme={lightButton} >
                                                    <Button variant="contained"
                                                        color="primary" className={`${classes.roundedBtn} ${classes.roomActionBtn}`}
                                                        onClick={() => toogleShowLinks(room.room_id)} >Get Links</Button>
                                                    <DeleteIcon onClick={() => deleteRoom(room.room_id)} style={{ color: "#767676" }} />
                                                </ThemeProvider>
                                            </StyledEngineProvider></StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default Rooms;