export interface Property {
  id: number;
  pkPropertyId: number;
  fkDistrictId: number;
  fkULBId: number;
  ULBCode: string | null;
  McName: string;
  KhasaraNo: string;
  AuthorityArea: string | null;
  ColonyName: string;
  fkColonySurveyId: number | null;
  PropertyCategory: string;
  PropertyType: string | null;
  PropertySubType: string | null;
  OwnerName: string;
  OwnerNameNDC: string | null;
  Address1: string;
  MobileNo: string | null;
  PID: string;
  PIDNDC: string;
  Unit: string;
  PlotSize: string;
  Lat: string;
  Long: string;
  ImageViewLink: string;
  LinkedpkPropertyId: number;
  IntegratedCount: number;
  LocationsDataJson: any;
  PageNo: number;
  TotalRecord: number;
  IsAuthorised: number;
  IsDataVerified2023: number;
  PossessionFile: any;
  DueDetails: any;
  PlotNo: string | null;
  ClaimCount: number;
  IntegratedCountCMCDMC: number;
  fkPropertySubTypeId: number;
  created_at: string;
  updated_at: string;
  response: string | null;
  remark: string | null;
}

export type ResponseStatus = 
  | 'Not contacted'
  | 'Unable to contact'
  | 'Another Person Phone'
  | 'Ready to Sell'
  | 'Not interested in Sell'
  | 'Interested in Buy'
  | 'Interested in Buy and Sell';

export interface FilterOptions {
  search: string;
  propertyCategory: string;
  colonyName: string;
  responseStatus: string;
  hasContact: boolean | null;
}

export type MapView = 'street' | 'satellite';