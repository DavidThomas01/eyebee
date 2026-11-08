import React, { useEffect, useState } from "react";

import {
    StyledEngineProvider,
    CssBaseline,
    Fade,
    Collapse,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import PerformanceTestRunner from "./perf-test-runner";
import SpeedTest from "./speed-test";
import WebRTCConnectionTest from "./webrtc-connection-test";

const useStyles = makeStyles(theme => ({
    mainBox: {
        display: "flex",
        flexDirection: "column",
        flex: "2",
        width: "100%"
    },
    mainText: {
        color: theme.palette.primary.main,
        textAlign: "center",
        fontWeight: "bold"
    },
    testLabel: {
        color: theme.palette.primary.main,
        textAlign: "center",
        fontWeight: "bold"
    },
    testValue: {
        color: theme.palette.primary.main,
        textAlign: "center",
        fontWeight: "bold"
    }

}));

function CircularProgressWithLabel(props) {
    const value = Math.round(props.value || 0);
    const ring = `conic-gradient(${props.theme.palette.primary.main} ${value * 3.6}deg, ${props.theme.palette.divider} 0deg)`;
    const mask = "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))";

    return (
        <div style={{ position: "relative", width: 50, height: 50 }}>
            <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: ring,
                WebkitMask: mask,
                mask,
            }} />
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <p style={{
                    margin: 0,
                    fontSize: 12,
                    color: props.theme.palette.primary.main,
                }}>{`${value}%`}</p>
            </div>
        </div>
    );
}

const PeerTestWidget = (props) => {       

    const classes = useStyles();
    const theme = useTheme();
    const [progress, setProgress] = useState(0);
    const [testResults, setTestResults] = useState(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
       
        let mockResults = null;
        if(!props.disabled){
            // GPU.js library is not loaded (commented out in index.html)
            const gpu = null;
            let suite = new window.Benchmark.Suite();
            let speedTest = new SpeedTest();
    
            let perfRunner = new PerformanceTestRunner(gpu,window.Benchmark, suite, speedTest,AbortController,props.abortTimeout || 5000);
    
            let wrtcTest = new WebRTCConnectionTest();
    
            setRunning(true);
            runTests(perfRunner, wrtcTest).then(results => {
    
    
                setTestResults(results);
                setRunning(false);
                props.onTestFinished && props.onTestFinished(results);
            }).catch(err => {

                //defaults to very low stats
                mockResults = {
                    CPU: {
                        name: "CPU",
                        value: 2
                    },
                    connectionType:
                    {
                        name: "Connection",
                        value: "STUN"
                    },
                    latency:{
                        name:"Latency",
                        value:2000
                    },
                    download: {
                        name: "Download",
                        value: 10
                    },
                    upload: {
                        name: "Upload",
                        value: 5
                    }
    
    
                };
                setRunning(false);
                console.error(err);
                setTestResults(mockResults);
                props.onTestFinished && props.onTestFinished(mockResults);
            });
        }else{
            //return mock test results to speed up testing
            
           

            if(props.forcedScores){
                let cpuValue = props.forcedScores.cpu || 2;
                let upload = props.forcedScores.upload || 10;
                let download = props.forcedScores.download || 5;
                mockResults = {
                    CPU: {
                        name: "CPU",
                        value: cpuValue
                    },
                    connectionType:
                    {
                        name: "Connection",
                        value: "STUN"
                    },
                    latency:{
                        name:"Latency",
                        value:100
                    },
                    download: {
                        name: "Download",
                        value: download
                    },
                    upload: {
                        name: "Upload",
                        value: upload
                    }
    
    
                };


            }
            props.onTestFinished && props.onTestFinished(mockResults);
        }


    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.disabled,props.forcedScores]);

    if(props.disabled){
        return (
            <div/>
        )
    }

    const runTests = async (perfRunner, webrtcConnTest) => {

        let results = {};

        let perfRes = await perfRunner.runAllTests(prog => {
            setProgress(prog);
        });

        Object.keys(perfRes).forEach(e => {
            results[e] = perfRes[e];
        });

        let type = await webrtcConnTest.checkTurnOrStun({ 'url': 'stun:stun.l.google.com:19302' });
        results["connectionType"] = {
            name: "Connection",
            value: type
        };
        if (type === "STUN") {

        } else {

        }

        return results;

    }


    return (
        <StyledEngineProvider injectFirst>
            <CssBaseline />
            <div className={classes.mainBox}>

                    <Collapse in={true} collapsedSize="3em" >
                        {
                            !running && testResults ?
                                (
                                    <Fade in={!running} >

                                        {
                                            props.showStats ?
                                            (
                                                <div style={{
                                                    display:"flex",
                                                    alignItems:"center",
                                                    justifyContent:"space-evenly"
                                                }}>
                
                                                    {
                                                        testResults && Object.keys(testResults).map( testId => {
                                                            return (
                                                                <div key={testId} style={{
                                                                    display:"flex",
                                                                    flexDirection:"column",
                                                                    alignItems:"center",
                                                                    justifyContent:"center",
                                                                    margin:"0 0.5em 0 0.5em"
                                                                }}>
                                                                    <p className={classes.testLabel}>
                                                                        {testResults[testId].name}
                                                                    </p>
                
                                                                    <p className={classes.testValue}>
                                                                        
                                                                        {
                                                                            ["CPU","GPU"].indexOf(testId) !== -1 ?
                
                                                                            testResults[testId].value.toFixed(4)+" "+(testResults[testId].unit ? testResults[testId].unit: "") :
                                                                            ( ["Latency"].indexOf(testId) !== -1 ? 
                                                                                testResults[testId].value.toFixed(0)+" "+(testResults[testId].unit ? testResults[testId].unit: "")
                                                                                :
                                                                                testResults[testId].value+" "+(testResults[testId].unit ? testResults[testId].unit: "")
                                                                            ) 
                                                                            
                                                                            
                                                                        }
                                                                    </p>
                
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                    
                                                </div>
                                            )
                                            :
                                            (
                                                <p style={{
                                                    color: theme.palette.primary.main,
                                                    fontWeight:"bold"
                                                }}>Done</p>
                                            )

                                        }

                                    </Fade>

                                )
                                :
                                (
                                    <Fade in={running} >
                                        <p className={classes.mainText}>
                                            Checking device capabilities, please wait a moment...
                                        </p>
                                    </Fade>

                                )
                        }

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>

                            {
                                progress < 100 ?
                                    (
                                        <Fade in={progress < 100} >
                                            <div>
                                                <CircularProgressWithLabel value={progress} theme={theme} size={50} />
                                            </div>
                                        </Fade>
                                    )
                                    :
                                    <div />
                            }

                            



                        </div>

                    </Collapse>

            </div>
        </StyledEngineProvider>
    );
};

export default PeerTestWidget;