import Subnet from './subnet';
export default class IC {
    _subnets: Subnet[];
    crawler: {
        enableExport: boolean;
        outputDir: string;
    };
    constructor();
    fetchAllSubnets: () => Promise<void>;
    parseAllSubnets: () => Promise<void>;
    printSubnets: () => void;
    exportObject(includeCanisters?: boolean): Promise<{
        subnets: any[];
    }>;
    printNetwork: () => Promise<void>;
    exportNetworkInfoToFile: () => Promise<void>;
    exportSubnetToFile: (s: any) => Promise<void>;
    initializeExport: () => void;
    writeToFile: (data: string, dir: string, fileName: string) => Promise<void>;
    runCrawler: (enableExport?: boolean) => Promise<void>;
}
