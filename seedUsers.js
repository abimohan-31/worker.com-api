import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// --------------------
// 1. Mongoose Models
// --------------------
const providerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
    address: String,
    experience_years: Number,
    skills: [String],
    availability_status: String,
    rating: Number,
    role: String,
    isApproved: Boolean,
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
    isActive: Boolean,
  },
  { timestamps: true }
);

import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    category: String,
    base_price: Number,
    unit: String,
    isActive: Boolean,
    icon: String,
  },
  { timestamps: true }
);

const Provider = mongoose.model("Provider", providerSchema);
const Customer = mongoose.model("Customer", customerSchema);
const Service = mongoose.model("Service", serviceSchema);

// --------------------
// 2. Provider & Customer Data
// --------------------
const providers = [
  {
    name: "Tharindu Weerasinghe",
    email: "tharindu.weerasinghe@example.com",
    phone: "0761234567",
    address: "Colombo",
    experience_years: 3,
    skills: ["Plumbing", "Maintenance"],
    availability_status: "Available",
    rating: 4,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Sajini Perera",
    email: "sajini.perera@example.com",
    phone: "0719876543",
    address: "Gampaha",
    experience_years: 2,
    skills: ["Cleaning"],
    availability_status: "Unavailable",
    rating: 5,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Dulitha Madushanka",
    email: "dulitha.madushanka@example.com",
    phone: "0758765432",
    address: "Kandy",
    experience_years: 4,
    skills: ["Electrician", "Repairing"],
    availability_status: "Available",
    rating: 3,
    role: "provider",
    isApproved: false,
  },
  {
    name: "Nadeesha Fernando",
    email: "nadeesha.fernando@example.com",
    phone: "0773456789",
    address: "Negombo",
    experience_years: 3,
    skills: ["Painting"],
    availability_status: "Available",
    rating: 4,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Ishara Jayawardena",
    email: "ishara.jayawardena@example.com",
    phone: "0742345678",
    address: "Matara",
    experience_years: 5,
    skills: ["Gardening", "Cleaning"],
    availability_status: "Unavailable",
    rating: 5,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Ravindu Silva",
    email: "ravindu.silva@example.com",
    phone: "0709988776",
    address: "Kurunegala",
    experience_years: 3,
    skills: ["Electrician"],
    availability_status: "Available",
    rating: 4,
    role: "provider",
    isApproved: false,
  },
  {
    name: "Gayani Dias",
    email: "gayani.dias@example.com",
    phone: "0768889991",
    address: "Ratnapura",
    experience_years: 2,
    skills: ["Cleaning"],
    availability_status: "Available",
    rating: 3,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Kaveeshan Ratnayake",
    email: "kaveeshan.ratnayake@example.com",
    phone: "0712233445",
    address: "Jaffna",
    experience_years: 4,
    skills: ["Plumbing", "Repairing"],
    availability_status: "Unavailable",
    rating: 4,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Sathsara Gunasekara",
    email: "sathsara.gunasekara@example.com",
    phone: "0751122334",
    address: "Anuradhapura",
    experience_years: 3,
    skills: ["Painting"],
    availability_status: "Available",
    rating: 5,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Harshi Aluwihare",
    email: "harshi.aluwihare@example.com",
    phone: "0776655443",
    address: "Kegalle",
    experience_years: 1,
    skills: ["Cleaning"],
    availability_status: "Unavailable",
    rating: 3,
    role: "provider",
    isApproved: false,
  },
  {
    name: "Sanjula Karunaratne",
    email: "sanjula.karunaratne@example.com",
    phone: "0702345678",
    address: "Colombo",
    experience_years: 2,
    skills: ["Electrician"],
    availability_status: "Available",
    rating: 4,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Nimashi Ranathunga",
    email: "nimashi.ranathunga@example.com",
    phone: "0763456789",
    address: "Galle",
    experience_years: 3,
    skills: ["Cleaning", "Gardening"],
    availability_status: "Available",
    rating: 5,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Kalpa Abeysekara",
    email: "kalpa.abeysekara@example.com",
    phone: "0715566778",
    address: "Matale",
    experience_years: 4,
    skills: ["Plumbing"],
    availability_status: "Unavailable",
    rating: 4,
    role: "provider",
    isApproved: false,
  },
  {
    name: "Vindya Udayanga",
    email: "vindya.udayanga@example.com",
    phone: "0754433221",
    address: "Trincomalee",
    experience_years: 2,
    skills: ["Painting"],
    availability_status: "Available",
    rating: 3,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Malith Peris",
    email: "malith.peris@example.com",
    phone: "0771122443",
    address: "Badulla",
    experience_years: 5,
    skills: ["Electrician"],
    availability_status: "Unavailable",
    rating: 5,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Yasas Muthumala",
    email: "yasas.muthumala@example.com",
    phone: "0746677889",
    address: "Kurunegala",
    experience_years: 3,
    skills: ["Plumbing"],
    availability_status: "Available",
    rating: 4,
    role: "provider",
    isApproved: false,
  },
  {
    name: "Chathuni Ekanayake",
    email: "chathuni.ekanayake@example.com",
    phone: "0709988771",
    address: "Hambantota",
    experience_years: 1,
    skills: ["Cleaning"],
    availability_status: "Available",
    rating: 3,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Sachintha Prabath",
    email: "sachintha.prabath@example.com",
    phone: "0765544332",
    address: "Nuwara Eliya",
    experience_years: 4,
    skills: ["Painter", "Repairing"],
    availability_status: "Unavailable",
    rating: 4,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Nirasha Herath",
    email: "nirasha.herath@example.com",
    phone: "0754455667",
    address: "Kandy",
    experience_years: 3,
    skills: ["Electrician"],
    availability_status: "Available",
    rating: 5,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Ayesh Fonseka",
    email: "ayesh.fonseka@example.com",
    phone: "0716677885",
    address: "Colombo",
    experience_years: 2,
    skills: ["Gardening"],
    availability_status: "Unavailable",
    rating: 3,
    role: "provider",
    isApproved: false,
  },
  {
    name: "Thilini Samarasekara",
    email: "thilini.samarasekara@example.com",
    phone: "0702233441",
    address: "Gampaha",
    experience_years: 3,
    skills: ["Painting"],
    availability_status: "Available",
    rating: 4,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Chamod Lakshan",
    email: "chamod.lakshan@example.com",
    phone: "0768899001",
    address: "Colombo",
    experience_years: 2,
    skills: ["Electrician"],
    availability_status: "Unavailable",
    rating: 5,
    role: "provider",
    isApproved: false,
  },
  {
    name: "Pavani Senanayake",
    email: "pavani.senanayake@example.com",
    phone: "0753322114",
    address: "Kegalle",
    experience_years: 4,
    skills: ["Cleaning"],
    availability_status: "Available",
    rating: 4,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Ramesh Priyadarshana",
    email: "ramesh.priyadarshana@example.com",
    phone: "0775566443",
    address: "Anuradhapura",
    experience_years: 5,
    skills: ["Plumbing"],
    availability_status: "Unavailable",
    rating: 5,
    role: "provider",
    isApproved: true,
  },
  {
    name: "Imesha Wijeratne",
    email: "imesha.wijeratne@example.com",
    phone: "0749988774",
    address: "Kurunegala",
    experience_years: 3,
    skills: ["Painting"],
    availability_status: "Available",
    rating: 4,
    role: "provider",
    isApproved: false,
  },
];

const customers = [
  {
    name: "Tharindu Weerasinghe",
    email: "tharindu.customer1@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Sajini Perera",
    email: "sajini.customer2@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Dilshan Jayawardena",
    email: "dilshan.customer3@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Nadeesha Fernando",
    email: "nadeesha.customer4@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Ishara Madushani",
    email: "ishara.customer5@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Ravindu Silva",
    email: "ravindu.customer6@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Gayani Dias",
    email: "gayani.customer7@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Kaveesha Ratnayake",
    email: "kaveesha.customer8@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Sathsara Gunasekara",
    email: "sathsara.customer9@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Harshi Aluwihare",
    email: "harshi.customer10@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Sanjula Karunaratne",
    email: "sanjula.customer11@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Nimashi Ranathunga",
    email: "nimashi.customer12@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Kalpa Abeysekara",
    email: "kalpa.customer13@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Vindya Udayanga",
    email: "vindya.customer14@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Malith Peris",
    email: "malith.customer15@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Yasas Muthumala",
    email: "yasas.customer16@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Chathuni Ekanayake",
    email: "chathuni.customer17@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Sachintha Prabath",
    email: "sachintha.customer18@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Nirasha Herath",
    email: "nirasha.customer19@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Ayesh Fonseka",
    email: "ayesh.customer20@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Thilini Samarasekara",
    email: "thilini.customer21@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Chamod Lakshan",
    email: "chamod.customer22@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Pavani Senanayake",
    email: "pavani.customer23@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Ramesh Priyadarshana",
    email: "ramesh.customer24@example.com",
    role: "customer",
    isActive: true,
  },
  {
    name: "Imesha Wijeratne",
    email: "imesha.customer25@example.com",
    role: "customer",
    isActive: true,
  },
];

const services = [
  {
    name: "Plumbing Repair",
    price: "1500",
    unit: "per hour",
    category: "Plumbing",
  },
  {
    name: "Pipe Leakage Fixing",
    price: "2500",
    unit: "per job",
    category: "Plumbing",
  },
  {
    name: "Electrical Wiring",
    price: "2000",
    unit: "per hour",
    category: "Electrical",
  },
  {
    name: "Fan Installation",
    price: "1800",
    unit: "per item",
    category: "Electrical",
  },
  {
    name: "Switchboard Repair",
    price: "1200",
    unit: "per item",
    category: "Electrical",
  },
  {
    name: "House Cleaning",
    price: "3000",
    unit: "per hour",
    category: "Cleaning",
  },
  {
    name: "Bathroom Deep Cleaning",
    price: "4500",
    unit: "per bathroom",
    category: "Cleaning",
  },
  {
    name: "Sofa Cleaning",
    price: "3500",
    unit: "per job",
    category: "Cleaning",
  },
  {
    name: "Garden Maintenance",
    price: "2500",
    unit: "per day",
    category: "Gardening",
  },
  {
    name: "Grass Cutting",
    price: "2000",
    unit: "per job",
    category: "Gardening",
  },
  {
    name: "Interior Painting",
    price: "180",
    unit: "per sqft",
    category: "Pain",
  },
];

// --------------------
// 3. Seed Function
// --------------------
async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Provider.deleteMany();
    await Customer.deleteMany();

    console.log("Old users removed");

    // Hash password for all
    const hashedPassword = await bcrypt.hash("Password123", 10);

    const providerData = providers.map((p) => ({
      ...p,
      password: hashedPassword,
    }));

    const customerData = customers.map((c) => ({
      ...c,
      password: hashedPassword,
    }));

    const serviceData = services.map((c) => ({
      ...c,
      password: hashedPassword,
    }));
    await Provider.insertMany(providerData);
    await Customer.insertMany(customerData);
    await Service.insertMany(serviceData);

    console.log("Seed successfully completed");
    process.exit();
  } catch (error) {
    console.error("Seed failed", error);
    process.exit(1);
  }
}

seedUsers();
