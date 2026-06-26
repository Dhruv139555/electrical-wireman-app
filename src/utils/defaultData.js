export const DEFAULT_COMPANY_PROFILE = {
  name: "HANSA ELECTRICAL",
  address: "B-29 murlidhar society, Ahmedabad, Gujarat, 382445",
  phone: "9687132082",
  email: "jayesh_bapu83@yahoo.com",
  pan: "EDZPS3115N",
  gstin: "", // Can be filled in Settings if they get registered
  bankName: "State Bank of India",
  bankAcc: "30294821034",
  bankIfsc: "SBIN0004123",
  bankBranch: "C.G. Road, Ahmedabad",
  state: "Gujarat",
  stateCode: "24",
  logoUrl: "" // Custom logo if uploaded
};

export const DEFAULT_MATERIALS = [
  { id: "1", name: "8 Module open box", unit: "NOS", rate: 80.00 },
  { id: "2", name: "1 module Blank", unit: "NOS", rate: 10.00 },
  { id: "3", name: "Male female pin", unit: "NOS", rate: 40.00 },
  { id: "4", name: "1.5 mm wire", unit: "MTR", rate: 25.00 },
  { id: "5", name: "19 mm flexible pipe", unit: "MTR", rate: 30.00 },
  { id: "6", name: "19 mm clip", unit: "NOS", rate: 1.50 },
  { id: "7", name: "5A socket point", unit: "NOS", rate: 200.00 },
  { id: "8", name: "Camera fitting", unit: "NOS", rate: 150.00 },
  { id: "9", name: "Fan open fitting", unit: "NOS", rate: 200.00 },
  { id: "10", name: "2.5 mm wire", unit: "MTR", rate: 35.00 },
  { id: "11", name: "4.0 mm wire", unit: "MTR", rate: 55.00 },
  { id: "12", name: "6 Module open box", unit: "NOS", rate: 60.00 },
  { id: "13", name: "12 Module open box", unit: "NOS", rate: 120.00 },
  { id: "14", name: "5A switch", unit: "NOS", rate: 25.00 },
  { id: "15", name: "15A switch", unit: "NOS", rate: 55.00 },
  { id: "16", name: "15A socket", unit: "NOS", rate: 60.00 },
  { id: "17", name: "Fan regulator", unit: "NOS", rate: 180.00 },
  { id: "18", name: "LED Panel Light 12W", unit: "NOS", rate: 250.00 },
  { id: "19", name: "MCB 16A Single Pole", unit: "NOS", rate: 140.00 },
  { id: "20", name: "MCB 32A Double Pole", unit: "NOS", rate: 450.00 },
  { id: "21", name: "Distribution Board 4-Way", unit: "NOS", rate: 650.00 },
  { id: "22", name: "Modular Plate 8 Module", unit: "NOS", rate: 110.00 }
];

export const DEFAULT_POINT_RATES = [
  { id: "p1", name: "Light Point Wiring", laborRate: 150, materialRate: 250, unit: "POINT" },
  { id: "p2", name: "Fan Point Wiring", laborRate: 150, materialRate: 250, unit: "POINT" },
  { id: "p3", name: "5A Socket Point Wiring", laborRate: 120, materialRate: 180, unit: "POINT" },
  { id: "p4", name: "15A Power Socket Wiring", laborRate: 250, materialRate: 350, unit: "POINT" },
  { id: "p5", name: "AC Point Wiring", laborRate: 450, materialRate: 750, unit: "POINT" },
  { id: "p6", name: "Geyser Point Wiring", laborRate: 400, materialRate: 600, unit: "POINT" },
  { id: "p7", name: "Bell Point Wiring", laborRate: 150, materialRate: 200, unit: "POINT" },
  { id: "p8", name: "TV / Telephone Point", laborRate: 120, materialRate: 150, unit: "POINT" },
  { id: "p9", name: "Distribution Board Fitting", laborRate: 500, materialRate: 1200, unit: "NOS" },
  { id: "p10", name: "Main Switch Installation", laborRate: 350, materialRate: 800, unit: "NOS" },
  { id: "p11", name: "Chemical Earthing Setup", laborRate: 1500, materialRate: 3500, unit: "SET" },
  { id: "p12", name: "Plate / Switch Fitting Charges", laborRate: 30, materialRate: 0, unit: "NOS" }
];

export const DEFAULT_TERMS = [
  "This is an electronically generated document.",
  "All disputes are subject to seller city jurisdiction.",
  "Quotation is valid for 30 days.",
  "50% advance payment required, remaining 50% on work completion."
];
