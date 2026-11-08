import React, { useState,useEffect,memo} from "react";
import { ThemeProvider, StyledEngineProvider, useTheme, createTheme, adaptV4Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import HexagonalAvatarWidget from "../HexagonalAvatarWidget";
import PeerListItem from "../PeerListItem";
import {MoreVert, PanTool,VideocamOff,Videocam,Mic,MicOff} from "@mui/icons-material";

import "./RoomPeers.css";
import { CssBaseline,IconButton,Menu,MenuItem } from "@mui/material";
import {FixedSizeList as List,areEqual} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import memoize from "memoize-one";



const darkFormField = createTheme(adaptV4Theme({
  palette:{
      background:{
          default: "#212121",
          paper:"#212121"
      },
      primary: {
          main: "#fafafa",
          contrastText:"#424242"
         
      },
      secondary:{
          main:"#fafafa",
          contrastText:"#424242"
      },
      text:{
          primary:"#fafafa",
          secondary:"#424242"
      },
      action:{
          disabled:"#ffe082",
          disabledBackground:"#ffe082",
          hover: "#F29F39"
      }
  }
}));

const useStyles = makeStyles(theme => ({
  mainBox:{
    display:"flex",
    flexDirection:"column",
    alignItems:"flex-start",
    justifyContent:"flex-start",
    backgroundColor: theme.palette.background.default,
    flex:"2",
    width:"100%"
  },
  separator:{
    paddingLeft:"1em",
    width:"100%",
    color: theme.palette.secondary.contrastText
  },
  list:{
    display: "flex",
    flexDirection: "column",
    flex:"2",
    padding:"0.5em",
    width:"100%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: theme.palette.lighterBg.main
  },
  listItem:{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width:"100%",
    padding:"0.5em",
    backgroundColor: theme.palette.lighterBg.main
  },
  listItemBox:{
    display: "flex",
    padding:"0.5em 1em 1em 1em",
    alignItems: "center",
    justifyContent: "flex-start",
    width:"100%",
    backgroundColor: theme.palette.lighterBg.main
  },
  actionBtn:{
      textTransform:"none",
      [theme.breakpoints.up('md')]: {
          fontSize: "0.7em" 
      },
      [theme.breakpoints.down('md')]: {
          fontSize: "0.7em" 
      }
  }
}));


const ListRow = memo(({data,index,style}) => {
  const theme = useTheme(); 
  const classes = useStyles();
  const {items,isOwner,userId,toggleMenu,handlePresentationRequest} = data; 
  const item = items[index];
  
  return (
    <div style={style}>
      <div className={classes.listItem} >
        <PeerListItem avatar={<HexagonalAvatarWidget background={item.presenter ? "primary" : "secondary"} />}  label={item.userName} >
            <p>{item.mic}</p>
            {
              !item.presenter ?
              (
                <IconButton
                  color="secondary"
                  className={classes.actionBtn}
                  style={{...theme.actionBtn,
                    pointerEvents: !isOwner ? "none" : "initial",
                      backgroundColor:"transparent",
                      color: item.presentationRequested ?  theme.palette.primary.main : theme.palette.secondary.contrastText
                  }}
                  onClick={e => handlePresentationRequest(e,item)}
                  size="large"> 
                    <PanTool style={theme.defaultIcon} />
                
                </IconButton>
              )
              :
              <div />
            }



            <IconButton
              color={
                item.camera ?
                "primary" : "secondary"}
              className={classes.actionBtn}
              style={{...theme.actionBtn,
                pointerEvents: !isOwner ? "none" : "initial",
                  backgroundColor:"transparent"
              }}
              size="large">
              {
                  item.camera ?
                  (
                      <Videocam style={theme.defaultIcon} />
                  )
                  :
                  (
                      <VideocamOff style={theme.defaultIcon} />
                  )
              }
            </IconButton>

            {
                item.presenter ?
                (
                    <IconButton
                      color={item.mic ? "primary" : "secondary"}
                      className={classes.actionBtn}
                      size="large"> 
                        {
                            item.mic ?
                            (
                                <Mic style={theme.defaultIcon} />
                            )
                            :
                            (
                                <MicOff style={theme.defaultIcon} />
                            )
                        }
                    
                    </IconButton>
                )
                :
                (
                    <div/>
                )
            }
            
            <IconButton
              color="secondary"
              className={classes.actionBtn}
              style={{...theme.actionBtn,
                  fontSize:"0.8em",
                  display: !isOwner ? "none":"initial",
                  visibility: isOwner && userId === item.id ? "hidden" : "visible",
                  backgroundColor:"transparent",
                  color: theme.palette.secondary.contrastText
              }}
              onClick={e => toggleMenu(e,item)}
              size="large"> 
                <MoreVert style={theme.defaultIcon} />
            
            </IconButton>
        </PeerListItem>
      </div>
    </div>
  );
},areEqual);


const createItemData = memoize((items,isOwner,userId,toggleMenu,handlePresentationRequest) => ({
  items: items,
  isOwner:isOwner,
  userId:userId,
  toggleMenu:toggleMenu,
  handlePresentationRequest:handlePresentationRequest
}));

const RoomPeers = (props) => {
  const theme = useTheme();
  const classes = useStyles();
  const [moderator, setModerator] = useState(null);
  const [presenters, setPresenters] = useState([]);
  const [spectators, setSpectators] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [spectatorAnchorEl, setSpectatorAnchorEl] = useState(null);
  const [presReqAnchorEl, setPresReqAnchorEl] = useState(null);

  useEffect(() => {

    const keys = Object.keys(props.peers);

    let peers = [];
    keys.forEach(e => {
      peers.push(props.peers[e]);
    });
    setPresenters(peers.filter(p => {return p.presenter}));
    setSpectators(peers.filter(p => {return !p.owner && !p.presenter;}));
    let mod = peers.filter(p => {return p.owner});
    mod = mod[0];
    setModerator(mod);

  },[props.peers]);

  const toggleMenu = (e,peer) => {
    setSelectedPeer(peer);
    setAnchorEl(e.currentTarget);

  }

  const toggleSpectatorMenu = (e,peer) => {
    setSelectedPeer(peer);
    setSpectatorAnchorEl(e.currentTarget);
  }

  const togglePresReqMenu = (e,peer) => {
    setSelectedPeer(peer);
    setPresReqAnchorEl(e.currentTarget);
  }

  const handleClose = () => {
    setSelectedPeer(null);
    setAnchorEl(null);
    setSpectatorAnchorEl(null);
    setPresReqAnchorEl(null);
  }

  const removePresentation = () => {
    props.removePresentation(selectedPeer.id);
    handleClose();
  }

  const assignAsPresenter = () => {
    props.grantPresentation(selectedPeer.id);
    handleClose();
  }

  const expel = () => {
    handleClose();
  }

  const mutePeer = () => {
    handleClose();
  }

  const sendMessage = () => {
    handleClose();
  }


  const acceptAsPresenter = () => {
    props.grantPresentation(selectedPeer.id);
    handleClose();
  }

  const rejectAsPresenter = () => {
    props.removePresentation(selectedPeer.id);
    handleClose();
  }

  const presenterListData = createItemData(presenters,props.owner,props.userId,toggleMenu);
  const spectatorListData = createItemData(spectators,props.owner,props.userId,toggleSpectatorMenu,togglePresReqMenu);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme} >
        <CssBaseline/>
        <div className={classes.mainBox}>
          <div className={classes.listItemBox}>
              <div className={classes.listItem}>
                
                <PeerListItem avatar={<HexagonalAvatarWidget background="primary" />}  label={moderator ? moderator.userName+" (Moderator)":"(Moderator)"} >
                </PeerListItem>
                
              </div>
          </div>
          

          <div className={classes.separator}>
            <p>Presenters</p>
          </div>
          <div className={classes.list}>

            {
              presenters && presenters.length === 0 ? 
              (
                <div className="room-peers-item">
                    <p className="room-peers-name">No Presenters</p>
                  </div>  
              )
              :
              (
                <div/>
              )
            }

            {
              presenters && presenters.length > 0 ? 
              (
                <div style={{
                  width:"100%",
                  flex:"2"
                }}>
                  <AutoSizer>
                    {
                      ({height, width}) => (
                        <List height={height}
                        itemCount={presenters.length}
                        itemData={presenterListData}
                        itemSize={70}
                        width={width}>
                            {ListRow}
                        </List>
                      )
                    }
                  </AutoSizer>
                </div>
              )
              :
              (
                <div/>
              )
            }



          </div>

            
                    <div className={classes.separator}>
            <p>Participants</p>
          </div>
          <div className={classes.list}>
              {
              spectators && spectators.length === 0 ? 
                (
                  <div className="room-peers-item">
                    <p className="room-peers-name">No Participants</p>
                  </div>  
                )
                :
                (
                  <div/>
                )
              }

              {
                  spectators && spectators.length > 0 ? 
                  (
                  <div style={{
                  width:"100%",
                  flex:"2"
                  }}>
                    <AutoSizer>
                      {
                        ({height, width}) => (
                          <List height={height}
                          itemCount={spectators.length}
                          itemData={spectatorListData}
                          itemSize={70}
                          width={width}>
                              {ListRow}
                          </List>
                        )
                      }
                    </AutoSizer>
                  </div>  
                )
                :
                (
                  <div/>
                )
              }

          </div>
                    <StyledEngineProvider injectFirst>
            <ThemeProvider theme={darkFormField} >
              <Menu
                color="primary"
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={removePresentation}>Remove Presentation</MenuItem>
                <MenuItem onClick={mutePeer}>Mute</MenuItem>
                <MenuItem onClick={sendMessage}>Send Message</MenuItem>
              </Menu>


              <Menu
                color="primary"
                id="simple-menu"
                anchorEl={spectatorAnchorEl}
                keepMounted
                open={Boolean(spectatorAnchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={assignAsPresenter}>Assign as presenter</MenuItem>
                <MenuItem onClick={expel}>Expel</MenuItem>
                <MenuItem onClick={sendMessage}>Send Message</MenuItem>
              </Menu>


              <Menu
                color="primary"
                id="simple-menu"
                anchorEl={presReqAnchorEl}
                keepMounted
                open={Boolean(presReqAnchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={acceptAsPresenter}>Accept</MenuItem>
                <MenuItem onClick={rejectAsPresenter}>Reject</MenuItem>
              </Menu>

            </ThemeProvider>
          </StyledEngineProvider>
          

        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default RoomPeers;