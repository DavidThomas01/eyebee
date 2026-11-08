class PerformanceTestRunner {
    
    constructor(gpuObj,Benchmark,benchmarkSuite,speedTest,AbortController,abortTimeout){
        this.gpu = gpuObj;
        this.suite = benchmarkSuite;
        this.speedTest = speedTest;
        this.Benchmark = Benchmark;
        this.AbortController = AbortController;
        this.abortTimeout = abortTimeout || 10;
    }

    _generateMatrices(size) {
        const matrices = [[], []]
        for (let y = 0; y < size; y++){
            matrices[0].push([])
            matrices[1].push([])
            for (let x = 0; x < size; x++){
                matrices[0][y].push(Math.random())
                matrices[1][y].push(Math.random())
            }
        }
        return matrices;
    }

    _cpuTest(baseNumber) {
            
        let result = 0;	
        for (var i = Math.pow(baseNumber, 7); i >= 0; i--) {		
            result += Math.atan(i) * Math.tan(i);
        };

        return result;
    }

    _gpuTest(gpu,matrixSize) {

        const matrices = this._generateMatrices(matrixSize);
       
        const multiplyMatrix = gpu.createKernel( function(matrixSize,a, b) {
            let sum = 0;
            for (let i = 0; i < matrixSize; i++) {
                sum += a[this.thread.y][i] * b[i][this.thread.x];
            }
            return sum;
        }).setOutput([matrixSize, matrixSize]);

        multiplyMatrix(matrixSize,matrices[0], matrices[1]);

        return true;
    }

    runCPUTest(baseNumber){
        let prom = new Promise((resolve,reject) => {

            let testResult = null;

            this.suite.add('cpu', () => {
                this._cpuTest(baseNumber || 5);
            })
            .on('cycle', (event) => {
                testResult = event.target;
            })
            .on('complete', () => {
                testResult.name = "CPU";
                testResult.value = testResult.stats.mean*100;
                resolve(testResult);
            })
            .on('error',error => {
                reject(error);
            })
            .on('abort',error => {
                reject(error);
            })
            .run({ 'async': true });

        });
        return prom;
    }

    runLatencyTest(abortController,abortTimeout){
        let prom = new Promise((resolve,reject) => {

            let testResult = null;

            this.suite.add("latency",{
                defer:true,
                maxTime:1,
                minSamples:2,
                fn: deferred => {
                    this.speedTest.latencyTest(abortController,abortTimeout).then(latency => {
                        
                        deferred.resolve(latency);
                    }).catch(err => {
                        
                        console.error("runLatencyTest -- error ",{error:err});
                        deferred.resolve(null);
                    });
                }
            })
            .on('cycle', (event) => {
                testResult = event.target;
            })
            .on('complete', () => {
                testResult.name = "Latency";
                testResult.unit = "ms";
                testResult.value = Math.round(testResult.stats.mean*1000);
                resolve(testResult);
            })
            .on('error',error => {
                reject(error);
            })
            .on('abort',error => {
                abortController.abort();
                reject(error);
            })
            .run({ 'async': true });

        });
        return prom;
    }

    runGPUTest(matrixSize){
        let prom = new Promise((resolve,reject) => {

            let testResult = null;

            this.suite.add('gpu', () => {
                this._gpuTest(this.gpu,matrixSize || 256);
            })
            .on('cycle', (event) => {
                testResult = event.target;
            })
            .on('complete', () => {
                testResult.name = "GPU";
                testResult.value = testResult.stats.mean*100;
                resolve(testResult);
            })
            .on('error',error => {
                reject(error);
            })
            .on('abort',error => {
                reject(error);
            })
            .run({ 'async': true });

        });
        return prom;
    }

    async runAllTests(progressCallback){
        progressCallback && progressCallback(0);
         let testResults = {};
        let cpuRes = await this.runCPUTest();
        progressCallback && progressCallback(25);
        testResults[cpuRes.name] = cpuRes;

        let abController = new this.AbortController();
        let latencyTest ;

        try{
            latencyTest = await this.runLatencyTest(abController,this.abortTimeout);
        }catch(err){
            latencyTest = {
                name:"Latency",
                value:9999,
                unit:"ms"
            }
        }
        progressCallback && progressCallback(50);
        testResults[latencyTest.name] = latencyTest;
       

        let speedTestRes = {
            download:{
                name:"Download",
                value:1
            },
            upload:{
                name:"Upload",
                value:1
            }
        };
        try{
            speedTestRes = await this.speedTest.runTest(30000);
        }catch(err){
            console.error(err);
        }
        
        progressCallback && progressCallback(100);
        testResults["download"] = speedTestRes.download; 
        testResults["upload"] = speedTestRes.upload;

        return testResults;
        

    }

}

export default PerformanceTestRunner;