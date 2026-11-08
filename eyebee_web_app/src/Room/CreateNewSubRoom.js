import React, { useState } from "react";

import {
    FormGroup,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    ThemeProvider,
    StyledEngineProvider,
    CssBaseline,
    adaptV4Theme,
} from "@mui/material";
import { createTheme, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';

const darkFormField = createTheme(adaptV4Theme({
    palette: {
        background: {
            default: "#212121",
            paper: "#212121"
        },
        primary: {
            main: "#fafafa",

        },
        secondary: {
            main: "#fafafa",
            contrastText: "#fafafa"
        },
        text: {
            primary: "#fafafa",
            secondary: "#bdbdbd"
        },
        action: {
            disabled: "#ffe082",
            disabledBackground: "#ffe082"
        }
    }
}));

const useStyles = makeStyles(theme => ({
    writeBox: {
        padding: "0.5em",
        alignItems: "center",
        justifyContent: "center",
        height: "100px",
        display: "flex"
    },
    newSubRoom: {
        position: "absolute",
        width: "24%",
        height: "40hv",
        left: "50%",
        top: "40%",
        transform: "translate(-50%, -50%)",
        WebkitTransform: "translate(-50%, -50%)",
        zIndex: "100",
        background: "#292929",
        borderRadius: "5px"
    }
}));


const CreateNewSubRoom = (props) => {

    const classes = useStyles();
    const theme = useTheme();
    const [roomName, setroomName] = useState("");
    const [roomMax, setRoomMax] = useState(0);
    const [type, setType] = useState('publica');


    const updateMessageField = e => {
        setroomName(e.target.value);
    }

    const updateRoomMaxField = e => {
        setRoomMax(e.target.value);
    }

    const createSubRoom = () => {
        props.createSubRoom(roomName, roomMax, type);
        props.toogleCreateNewSubRoom();
        props.toggleSideBox({ section: "subrooms", opened: true });
    }

    const handleChange = (event) => {
        setType(event.target.value);
    };


    return (
        <StyledEngineProvider injectFirst><ThemeProvider theme={theme}>
                    <CssBaseline />
                    <div className={classes.newSubRoom} id="new-room">
                        <div className={classes.writeBox}>
                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={darkFormField} >
                                    <TextField
                                        style={{
                                            flex: "2",
                                            backgroundColor: darkFormField.palette.background.default
                                        }}
                                        value={roomName}
                                        onChange={updateMessageField}
                                        placeholder="Sala 1"
                                        variant="outlined"
                                        rows={1}
                                        maxRows={1}
                                    />
                                </ThemeProvider>
                            </StyledEngineProvider>

                            <StyledEngineProvider injectFirst>
                                <ThemeProvider theme={darkFormField} >
                                    <TextField
                                        style={{
                                            flex: "1",
                                            backgroundColor: darkFormField.palette.background.default
                                        }}
                                        value={roomMax}
                                        onChange={updateRoomMaxField}
                                        placeholder="Usuarios"
                                        variant="outlined"
                                        type="number"
                                    />
                                </ThemeProvider>
                            </StyledEngineProvider>


                        </div>
                        <div className={classes.writeBox}>
                            <FormGroup row>
                                <StyledEngineProvider injectFirst>
                                    <ThemeProvider theme={darkFormField} >

                                        <RadioGroup aria-label="gender" name="gender1" value={type} onChange={handleChange}>
                                            <FormControlLabel value="public" control={<Radio style={{
                                                flex: "1"
                                            }} />} label="Publica" />
                                            <FormControlLabel value="private" control={<Radio style={{
                                                flex: "1"
                                            }} />} label="Privada" />
                                        </RadioGroup>

                                    </ThemeProvider>
                                </StyledEngineProvider>
                            </FormGroup>

                        </div>
                        <div className={classes.writeBox}>
                            <Button color={"secondary"}
                                style={{
                                    flex: "1",
                                    border: "solid 2px #4e4d4d",
                                    color: "#4e4d4d",
                                    borderRadius: "5px",
                                    padding: "5px",
                                    maxWidth: "120px",
                                    margin: "10px"
                                }}
                                onClick={props.toogleCreateNewSubRoom}
                            >
                                Cancelar
                            </Button>
                            <Button color={"primary"}
                                style={{
                                    flex: "1",
                                    border: "solid 2px #f29f3f",
                                    borderRadius: "5px",
                                    padding: "5px",
                                    background: "#f29f3f",
                                    color: "#fff",
                                    maxWidth: "120px",
                                    margin: "10px"
                                }}
                                onClick={createSubRoom}
                            >
                                Crear
                            </Button>

                        </div>
                    </div>
                </ThemeProvider>
                    </StyledEngineProvider>
    );
}

export default CreateNewSubRoom;