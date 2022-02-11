import Subnet from './subnet';
export default class Crawler {
    _subnets: Subnet[];
    private _enableExport;
    private _outputDir;
    constructor();
    set enableExport(enable: boolean);
    set outputDir(dir: string);
    get enableExport(): boolean;
    get outputDir(): string;
    fetchAllSubnets: () => Promise<void>;
    parseAllSubnets: () => Promise<void>;
    exportObject(includeCanisters?: boolean): Promise<{
        subnets: any[];
    }>;
    printNetwork: () => Promise<void>;
    exportNetworkInfoToFile: () => Promise<void>;
    exportSubnetToFile: (s: any) => Promise<void>;
    initializeExport: () => void;
    writeToFile: (data: string, dir: string, fileName: string) => Promise<void>;
    run(initFromFile?: boolean): Promise<void>;
    initializeFromFile(): Promise<void>;
}
