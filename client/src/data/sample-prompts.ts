export const samplePrompts = [
  // FREE QUESTIONS (1-10)
  {
    officer: "What are you hauling?",
    driver: "I'm hauling refrigerated meat products for a grocery chain.",
    id: 1,
    isFree: true
  },
  {
    officer: "How far are you from your delivery location?",
    driver: "I'm about 120 miles away from my drop-off point.",
    id: 2,
    isFree: true
  },
  {
    officer: "Are your load straps secure?",
    driver: "Yes, I double-checked all straps before leaving the warehouse.",
    id: 3,
    isFree: true
  },
  {
    officer: "When did you last take a break?",
    driver: "About 30 minutes ago, I stopped at a rest area for lunch.",
    id: 4,
    isFree: true
  },
  {
    officer: "Are you hauling perishable goods?",
    driver: "Yes, I'm transporting frozen vegetables in a reefer trailer.",
    id: 5,
    isFree: true
  },
  {
    officer: "What company are you driving for?",
    driver: "I'm with American Freight Logistics, based in Chicago.",
    id: 6,
    isFree: true
  },
  {
    officer: "Are you aware of any violations on your record?",
    driver: "No, my record is clean for the past two years.",
    id: 7,
    isFree: true
  },
  {
    officer: "Are you using a paper log or an ELD?",
    driver: "I'm using an Electronic Logging Device to track my hours.",
    id: 8,
    isFree: true
  },
  {
    officer: "Have you had any alcohol in the last 24 hours?",
    driver: "No, officer. I haven't consumed any alcohol.",
    id: 9,
    isFree: true
  },
  {
    officer: "Is your horn and lighting system working properly?",
    driver: "Yes, I tested them during my pre-trip inspection.",
    id: 10,
    isFree: true
  },
  // PREMIUM QUESTIONS (11-200)
  {
    officer: "Is your speed limiter functioning correctly?",
    driver: "Yes, it's working as required and set at 65 mph.",
    id: 11,
    isPremium: true
  },
  {
    officer: "Is your fire extinguisher charged and accessible?",
    driver: "Yes, it's fully charged and mounted right behind my seat.",
    id: 12,
    isPremium: true
  },
  {
    officer: "Is your trailer properly sealed?",
    driver: "Yes, the seal is intact and matches the shipping paperwork.",
    id: 13,
    isPremium: true
  },
  {
    officer: "Have you had any recent accidents or tickets?",
    driver: "No, I've had a clean record for over a year now.",
    id: 14,
    isPremium: true
  },
  {
    officer: "Have you completed your pre-trip inspection today?",
    driver: "Yes, I checked the tires, lights, brakes, and fluids this morning.",
    id: 15,
    isPremium: true
  },
  {
    officer: "Did you secure the back door of your trailer?",
    driver: "Yes, it's locked and sealed properly.",
    id: 16,
    isPremium: true
  },
  {
    officer: "How long have you been a CDL driver?",
    driver: "I've been driving commercially for 7 years now.",
    id: 17,
    isPremium: true
  },
  {
    officer: "Did you encounter any mechanical issues today?",
    driver: "No issues today, everything has been running smoothly.",
    id: 18,
    isPremium: true
  },
  {
    officer: "Is your load balanced properly?",
    driver: "Yes, it was checked and balanced during loading.",
    id: 19,
    isPremium: true
  },
  {
    officer: "Where did you last refuel?",
    driver: "I stopped at the Love's truck stop 40 miles back.",
    id: 20,
    isPremium: true
  },
  {
    officer: "Have you checked your tire pressure today?",
    driver: "Yes, I used a gauge before starting my shift this morning.",
    id: 21,
    isPremium: true
  },
  {
    officer: "Do you know your trailer's height and weight?",
    driver: "Yes, the height is 13 feet 6 inches and weight is 34,000 pounds empty.",
    id: 22,
    isPremium: true
  },
  {
    officer: "Can you explain what's in your load today?",
    driver: "Sure, I'm hauling pallets of dry food and packaged goods.",
    id: 23,
    isPremium: true
  },
  {
    officer: "How long have you been working with your current company?",
    driver: "I've been with them for about 14 months.",
    id: 24,
    isPremium: true
  },
  {
    officer: "What time did you start your shift today?",
    driver: "I began my shift at 6:30 this morning.",
    id: 25,
    isPremium: true
  },
  {
    officer: "Do you have reflective triangles or flares on board?",
    driver: "Yes, officer. I keep them stored in the side box.",
    id: 26,
    isPremium: true
  },
  {
    officer: "Can I see your driver's license and medical certificate?",
    driver: "Yes, officer. Here are both documents.",
    id: 27,
    isPremium: true
  },
  {
    officer: "Do you know why I pulled you over?",
    driver: "I'm not sure, officer. Was I speeding or crossing a line?",
    id: 28,
    isPremium: true
  },
  {
    officer: "Are you familiar with the HOS rules?",
    driver: "Yes, I follow the Hours of Service rules carefully.",
    id: 29,
    isPremium: true
  },
  {
    officer: "When was your last safety inspection?",
    driver: "It was done last week before I left the terminal.",
    id: 30,
    isPremium: true
  },
  {
    officer: "Are you carrying your registration and insurance papers?",
    driver: "Yes, officer. They're in the glove compartment.",
    id: 31,
    isPremium: true
  },
  {
    officer: "How long have you been driving today?",
    driver: "I've been on the road for 5 hours so far today.",
    id: 32,
    isPremium: true
  },
  {
    officer: "Where are you headed today?",
    driver: "I'm driving to Houston, Texas to deliver a load of produce.",
    id: 33,
    isPremium: true
  },
  {
    officer: "Do you have your bill of lading?",
    driver: "Yes, officer. Here it is, showing pickup and delivery details.",
    id: 34,
    isPremium: true
  },
  {
    officer: "Do you have a valid medical card?",
    driver: "Yes, officer. It's in my wallet and still valid for 8 months.",
    id: 35,
    isPremium: true
  },
  {
    officer: "Do you know what your tire tread depth is?",
    driver: "Yes, it's above the legal limit—checked this morning.",
    id: 36,
    isPremium: true
  },
  {
    officer: "Are you hauling any hazardous materials?",
    driver: "No, this is a dry van with general consumer goods.",
    id: 37,
    isPremium: true
  },
  {
    officer: "How many hours have you rested in the past 24 hours?",
    driver: "I've had 10 hours of off-duty rest before starting this trip.",
    id: 38,
    isPremium: true
  },
  {
    officer: "Do you know your gross vehicle weight?",
    driver: "Yes, it's about 78,000 pounds loaded.",
    id: 39,
    isPremium: true
  },
  {
    officer: "Have you been feeling alert during your trip?",
    driver: "Yes, I'm fully rested and alert, officer.",
    id: 40,
    isPremium: true
  },
  {
    officer: "Are you carrying any oversized loads today?",
    driver: "No, officer. This load is within legal size and weight limits.",
    id: 41,
    isPremium: true
  },
  {
    officer: "Can you show me your emergency contact information?",
    driver: "Yes, it's listed on the back of my license and in my company profile.",
    id: 42,
    isPremium: true
  },
  {
    officer: "Is your ELD device synced properly?",
    driver: "Yes, it's working fine and synced with the vehicle's engine.",
    id: 43,
    isPremium: true
  },
  {
    officer: "When was your last drug and alcohol test?",
    driver: "It was two months ago, and I passed with no issues.",
    id: 44,
    isPremium: true
  },
  {
    officer: "Are you aware of your company's safety rating?",
    driver: "Yes, we currently hold a satisfactory safety rating from FMCSA.",
    id: 45,
    isPremium: true
  },
  {
    officer: "Do you have a co-driver today?",
    driver: "No, officer. I'm driving solo on this trip.",
    id: 46,
    isPremium: true
  },
  {
    officer: "Can you explain how you handled your cargo securement?",
    driver: "I used load locks and straps, checked every 150 miles.",
    id: 47,
    isPremium: true
  },
  {
    officer: "Have you had any recent vehicle repairs?",
    driver: "Yes, we just replaced the brake pads last week.",
    id: 48,
    isPremium: true
  },
  {
    officer: "What's your current duty status?",
    driver: "I'm currently on-duty, not driving.",
    id: 49,
    isPremium: true
  },
  {
    officer: "Did you review the weather before your route?",
    driver: "Yes, I checked and there are no alerts for my route.",
    id: 50,
    isPremium: true
  },
  {
    officer: "Have you inspected your brake system today?",
    driver: "Yes, I checked for leaks and air pressure levels this morning.",
    id: 51,
    isPremium: true
  },
  {
    officer: "Is your CDL currently valid and unrestricted?",
    driver: "Yes, officer. My CDL is valid and without restrictions.",
    id: 52,
    isPremium: true
  },
  {
    officer: "Do you carry a copy of the Federal Motor Carrier Safety Regulations?",
    driver: "Yes, I have a digital copy on my tablet.",
    id: 53,
    isPremium: true
  },
  {
    officer: "How many hours have you driven in the last 7 days?",
    driver: "I've driven around 42 hours this week.",
    id: 54,
    isPremium: true
  },
  {
    officer: "Are your mirrors and windows clean and unobstructed?",
    driver: "Yes, I cleaned all of them before departure today.",
    id: 55,
    isPremium: true
  },
  {
    officer: "Do you know how to use your fire extinguisher?",
    driver: "Yes, I've been trained and it's mounted behind my seat.",
    id: 56,
    isPremium: true
  },
  {
    officer: "Have you reported your last delivery to dispatch?",
    driver: "Yes, I checked in once I arrived at the receiver.",
    id: 57,
    isPremium: true
  },
  {
    officer: "Have you had any logbook violations in the past month?",
    driver: "No, officer. My logs have been in full compliance.",
    id: 58,
    isPremium: true
  },
  {
    officer: "Do you have an emergency reflective vest?",
    driver: "Yes, it's stored in the door pocket.",
    id: 59,
    isPremium: true
  },
  {
    officer: "When was the last time your truck was serviced?",
    driver: "It was serviced two weeks ago at our company shop.",
    id: 60,
    isPremium: true
  },
  {
    officer: "What would you do in case of a tire blowout?",
    driver: "I'd maintain control, pull over safely, and call for roadside help.",
    id: 61,
    isPremium: true
  },
  {
    officer: "Do you carry a paper backup log?",
    driver: "Yes, it's in my logbook folder in case the ELD fails.",
    id: 62,
    isPremium: true
  },
  {
    officer: "Can you describe how your cargo is loaded?",
    driver: "It's evenly distributed on pallets with load bars in place.",
    id: 63,
    isPremium: true
  },
  {
    officer: "Are your seat belts functioning correctly?",
    driver: "Yes, officer. I tested them before leaving the lot.",
    id: 64,
    isPremium: true
  },
  {
    officer: "Do you have your fuel receipts from the last state?",
    driver: "Yes, I saved them for IFTA reporting.",
    id: 65,
    isPremium: true
  },
  {
    officer: "Are you hauling a load that requires placards?",
    driver: "No, officer. This is a standard dry load.",
    id: 66,
    isPremium: true
  },
  {
    officer: "Is your air compressor functioning properly?",
    driver: "Yes, I checked the build-up time this morning.",
    id: 67,
    isPremium: true
  },
  {
    officer: "Do you know how to perform a leak-down test?",
    driver: "Yes, I follow DOT steps for that test regularly.",
    id: 68,
    isPremium: true
  },
  {
    officer: "Are your windshield wipers in good condition?",
    driver: "Yes, they're new and working well.",
    id: 69,
    isPremium: true
  },
  {
    officer: "Do you know where your ABS indicator light is?",
    driver: "Yes, it's on the dashboard and working correctly.",
    id: 70,
    isPremium: true
  },
  {
    officer: "Have you had any hours-of-service violations this quarter?",
    driver: "No, officer. I've stayed within all HOS limits.",
    id: 71,
    isPremium: true
  },
  {
    officer: "Can I see your reefer temperature logs?",
    driver: "Yes, I have them here in my trip records.",
    id: 72,
    isPremium: true
  },
  {
    officer: "When was your last load secured inspection?",
    driver: "It was done this morning at our shipper's dock.",
    id: 73,
    isPremium: true
  },
  {
    officer: "What's your tire inflation pressure today?",
    driver: "They're all at 100 PSI as required.",
    id: 74,
    isPremium: true
  },
  {
    officer: "Are your trailer lights all functional?",
    driver: "Yes, I confirmed during my pre-trip check.",
    id: 75,
    isPremium: true
  },
  {
    officer: "Do you have your permit for the oversized load?",
    driver: "Yes, it's attached to my trip sheet.",
    id: 76,
    isPremium: true
  },
  {
    officer: "Can I see your IFTA permit?",
    driver: "Yes, it's displayed inside the driver-side door.",
    id: 77,
    isPremium: true
  },
  {
    officer: "Do you carry a spill kit in case of leaks?",
    driver: "Yes, it's in the side equipment box.",
    id: 78,
    isPremium: true
  },
  {
    officer: "Do you know how to report a crash to FMCSA?",
    driver: "Yes, we follow our safety manager's protocol and file reports promptly.",
    id: 79,
    isPremium: true
  },
  {
    officer: "Can you provide your current trip manifest?",
    driver: "Yes, officer. Here's the manifest outlining all cargo and stops.",
    id: 80,
    isPremium: true
  },
  {
    officer: "Have you had any maintenance issues in the last month?",
    driver: "Just a minor issue with a tire, but it was fixed right away.",
    id: 81,
    isPremium: true
  },
  {
    officer: "Do you have an emergency contact listed with your company?",
    driver: "Yes, my company has my emergency contact on file.",
    id: 82,
    isPremium: true
  },
  {
    officer: "Do you carry a reflective vest for roadside inspections?",
    driver: "Yes, officer. It's stored in my side compartment.",
    id: 83,
    isPremium: true
  },
  {
    officer: "What's the total mileage for this trip?",
    driver: "It's about 1,200 miles from start to destination.",
    id: 84,
    isPremium: true
  },
  {
    officer: "Have you received any warnings this week?",
    driver: "No, officer. My log is clean for the week.",
    id: 85,
    isPremium: true
  },
  {
    officer: "Can you show proof of delivery for your last trip?",
    driver: "Yes, here is the signed delivery receipt from yesterday.",
    id: 86,
    isPremium: true
  },
  {
    officer: "What kind of brakes does your trailer use?",
    driver: "It uses air brakes, inspected this morning.",
    id: 87,
    isPremium: true
  },
  {
    officer: "Did you check your coupling devices today?",
    driver: "Yes, I inspected the kingpin and fifth wheel during pre-trip.",
    id: 88,
    isPremium: true
  },
  {
    officer: "How do you handle fatigue while driving long distances?",
    driver: "I take breaks every few hours and avoid driving when tired.",
    id: 89,
    isPremium: true
  },
  {
    officer: "How often do you perform full vehicle inspections?",
    driver: "I do a complete inspection before every trip and mid-trip on long hauls.",
    id: 90,
    isPremium: true
  },
  {
    officer: "Are your side mirrors adjusted correctly?",
    driver: "Yes, officer. I adjusted them before leaving the yard.",
    id: 91,
    isPremium: true
  },
  {
    officer: "Are you familiar with the nearest weigh station?",
    driver: "Yes, I passed it about 20 miles ago and everything was fine.",
    id: 92,
    isPremium: true
  },
  {
    officer: "Do you carry a first aid kit?",
    driver: "Yes, it's stored with the other safety equipment behind my seat.",
    id: 93,
    isPremium: true
  },
  {
    officer: "Are your turn signals and brake lights working properly?",
    driver: "Yes, I tested all lights during my inspection today.",
    id: 94,
    isPremium: true
  },
  {
    officer: "Have you ever had a DOT audit?",
    driver: "Not personally, but my company undergoes regular audits.",
    id: 95,
    isPremium: true
  },
  {
    officer: "Are you aware of the current weather advisory for your route?",
    driver: "Yes, I checked the weather before starting and have chains if needed.",
    id: 96,
    isPremium: true
  },
  {
    officer: "What's your trailer number?",
    driver: "It's trailer 40721, officer.",
    id: 97,
    isPremium: true
  },
  {
    officer: "Do you have a copy of your CDL medical examination report?",
    driver: "Yes, I have the certificate and the long-form in my folder.",
    id: 98,
    isPremium: true
  },
  {
    officer: "Do you carry spare fuses for electrical equipment?",
    driver: "Yes, I keep extra fuses in the dashboard compartment.",
    id: 99,
    isPremium: true
  },
  {
    officer: "Are you trained in using fire extinguishers?",
    driver: "Yes, I've completed safety training as part of onboarding.",
    id: 100,
    isPremium: true
  },
  {
    officer: "What speed were you traveling in the last construction zone?",
    driver: "I reduced to 45 mph as posted through the zone.",
    id: 101,
    isPremium: true
  },
  {
    officer: "Have you reviewed your logbook for errors today?",
    driver: "Yes, I checked everything this morning and it's accurate.",
    id: 102,
    isPremium: true
  },
  {
    officer: "When did you last attend a safety meeting?",
    driver: "Two weeks ago at our main terminal.",
    id: 103,
    isPremium: true
  },
  {
    officer: "Is your CB radio functioning?",
    driver: "Yes, it's working fine and I use it for traffic updates.",
    id: 104,
    isPremium: true
  },
  {
    officer: "Can you demonstrate your air brake check?",
    driver: "Yes, I can perform the air brake test for you now.",
    id: 105,
    isPremium: true
  },
  {
    officer: "What's the cargo value you're hauling today?",
    driver: "It's valued at around $85,000 according to the invoice.",
    id: 106,
    isPremium: true
  },
  {
    officer: "Do you have proof of your last drug test?",
    driver: "Yes, officer. My company has it on file and I carry a copy.",
    id: 107,
    isPremium: true
  },
  {
    officer: "What's your current fuel level?",
    driver: "I have about three-quarters of a tank.",
    id: 108,
    isPremium: true
  },
  {
    officer: "Have you crossed any state borders on this trip?",
    driver: "Yes, I've come from Nevada into California.",
    id: 109,
    isPremium: true
  },
  {
    officer: "Do you carry a spill kit for hazardous materials?",
    driver: "Yes, although I'm not hauling hazmat today, I have a kit on board.",
    id: 110,
    isPremium: true
  },
  {
    officer: "Can you show me your annual inspection sticker?",
    driver: "Yes, it's affixed to the driver-side door frame.",
    id: 111,
    isPremium: true
  },
  {
    officer: "Do you know the expiration date on your insurance?",
    driver: "Yes, it expires in three months — September 15th.",
    id: 112,
    isPremium: true
  },
  {
    officer: "Do you have any dashcam footage from today?",
    driver: "Yes, the dashcam records continuously and stores 48 hours of footage.",
    id: 113,
    isPremium: true
  },
  {
    officer: "How do you plan for your rest stops?",
    driver: "I use my ELD to plan breaks and mark safe rest areas in advance.",
    id: 114,
    isPremium: true
  },
  {
    officer: "How do you keep in touch with dispatch during long trips?",
    driver: "I use a hands-free phone and company mobile app to stay updated.",
    id: 115,
    isPremium: true
  },
  {
    officer: "Are you hauling any goods that require refrigeration?",
    driver: "Yes, I'm transporting frozen poultry at 28 degrees Fahrenheit.",
    id: 116,
    isPremium: true
  },
  {
    officer: "How do you prevent load shifts?",
    driver: "I use load bars, straps, and make sure everything is tightly secured.",
    id: 117,
    isPremium: true
  },
  {
    officer: "Do you carry snow chains or traction devices?",
    driver: "Yes, I carry chains during the winter season as required by law.",
    id: 118,
    isPremium: true
  },
  {
    officer: "What's your average fuel economy?",
    driver: "It's about 6.8 miles per gallon under full load.",
    id: 119,
    isPremium: true
  },
  {
    officer: "What do you do if your ELD malfunctions on the road?",
    driver: "I switch to paper logs and notify my carrier immediately.",
    id: 120,
    isPremium: true
  },
  {
    officer: "Are your wipers and washer fluid working correctly?",
    driver: "Yes, I tested both during my pre-trip check.",
    id: 121,
    isPremium: true
  },
  {
    officer: "Do you understand how to perform a brake test?",
    driver: "Yes, I can demonstrate a static and applied pressure test.",
    id: 122,
    isPremium: true
  },
  {
    officer: "Do you have a copy of your annual vehicle inspection?",
    driver: "Yes, it's in my document binder under inspections.",
    id: 123,
    isPremium: true
  },
  {
    officer: "Have you passed through any weigh stations today?",
    driver: "Yes, I stopped at one about 80 miles back.",
    id: 124,
    isPremium: true
  },
  {
    officer: "Is your DOT number clearly visible on the vehicle?",
    driver: "Yes, it's displayed on both doors in compliance.",
    id: 125,
    isPremium: true
  },
  {
    officer: "How do you secure a load of loose materials?",
    driver: "With tarps, netting, and additional tie-downs if needed.",
    id: 126,
    isPremium: true
  },
  {
    officer: "Have you done a walk-around inspection today?",
    driver: "Yes, I did a full walk-around before starting my shift.",
    id: 127,
    isPremium: true
  },
  {
    officer: "Do you know how to handle a tire blowout?",
    driver: "Yes, keep steady control and slow down gradually.",
    id: 128,
    isPremium: true
  },
  {
    officer: "How do you respond if your brakes start overheating?",
    driver: "I pull over safely and allow them to cool down before proceeding.",
    id: 129,
    isPremium: true
  },
  {
    officer: "Do you know how to adjust your air brakes?",
    driver: "Yes, but I let certified mechanics handle adjustments for safety.",
    id: 130,
    isPremium: true
  },
  {
    officer: "Do you maintain a daily inspection checklist?",
    driver: "Yes, it's part of my routine log entries.",
    id: 131,
    isPremium: true
  },
  {
    officer: "Have you inspected the undercarriage today?",
    driver: "Yes, I checked for leaks or loose parts during my pre-trip.",
    id: 132,
    isPremium: true
  },
  {
    officer: "Is your fuel cap secure and not leaking?",
    driver: "Yes, it's sealed tight and checked regularly.",
    id: 133,
    isPremium: true
  },
  {
    officer: "Do you carry a first aid kit?",
    driver: "Yes, it's stored behind my seat and fully stocked.",
    id: 134,
    isPremium: true
  },
  {
    officer: "Can you tell me your trailer axle weight?",
    driver: "Yes, it's listed on my scale ticket from this morning.",
    id: 135,
    isPremium: true
  },
  {
    officer: "How do you handle merging in heavy traffic?",
    driver: "I maintain safe following distance and signal early.",
    id: 136,
    isPremium: true
  },
  {
    officer: "Do you use a trip planning system?",
    driver: "Yes, I use a GPS and written route plan before each trip.",
    id: 137,
    isPremium: true
  },
  {
    officer: "Do you have reflective vests or safety gear?",
    driver: "Yes, I wear a high-vis vest when outside the cab.",
    id: 138,
    isPremium: true
  },
  {
    officer: "Have you done a tug test today?",
    driver: "Yes, I performed a tug test to verify trailer connection.",
    id: 139,
    isPremium: true
  },
  {
    officer: "What do you do in case of a cargo shift?",
    driver: "I stop immediately and secure the load before continuing.",
    id: 140,
    isPremium: true
  },
  {
    officer: "How do you check air leak rate on a truck?",
    driver: "By performing a leak-down test with brakes applied and released.",
    id: 141,
    isPremium: true
  },
  {
    officer: "Can you name three key items in your roadside emergency kit?",
    driver: "Reflective triangles, flashlight, and basic tools.",
    id: 142,
    isPremium: true
  },
  {
    officer: "What do you do when driving through high wind areas?",
    driver: "I slow down and grip the wheel firmly, especially if empty.",
    id: 143,
    isPremium: true
  },
  {
    officer: "Do you understand bridge clearance requirements?",
    driver: "Yes, I check all bridge heights on my route beforehand.",
    id: 144,
    isPremium: true
  },
  {
    officer: "When was your last tire rotation or replacement?",
    driver: "Tires were rotated at the last service two weeks ago.",
    id: 145,
    isPremium: true
  },
  {
    officer: "Are you required to carry chain-up gear in winter?",
    driver: "Yes, depending on the state laws and weather conditions.",
    id: 146,
    isPremium: true
  },
  {
    officer: "What is your company's DOT safety rating?",
    driver: "We're rated 'Satisfactory' by FMCSA.",
    id: 147,
    isPremium: true
  },
  {
    officer: "Do you review your logbook for errors before submission?",
    driver: "Yes, I always double-check my entries.",
    id: 148,
    isPremium: true
  },
  {
    officer: "Do you keep tools for minor repairs onboard?",
    driver: "Yes, for basic adjustments like mirrors or panels.",
    id: 149,
    isPremium: true
  },
  {
    officer: "Do you have a specific fuel economy goal?",
    driver: "Yes, I aim to stay above 6.5 mpg on highways.",
    id: 150,
    isPremium: true
  },
  {
    officer: "What's your typical driving shift duration?",
    driver: "Usually 8 to 9 hours with regular breaks.",
    id: 151,
    isPremium: true
  },
  {
    officer: "Do you track your vehicle maintenance digitally?",
    driver: "Yes, we use an app that logs all service records.",
    id: 152,
    isPremium: true
  },
  {
    officer: "Have you ever transported oversize loads?",
    driver: "Yes, I've done that with proper permits and escorts.",
    id: 153,
    isPremium: true
  },
  {
    officer: "How do you handle poor visibility on the road?",
    driver: "Slow down, use low beams, and increase following distance.",
    id: 154,
    isPremium: true
  },
  {
    officer: "Do you ever run empty return trips?",
    driver: "Sometimes, depending on dispatch and location.",
    id: 155,
    isPremium: true
  },
  {
    officer: "Do you record personal conveyance time?",
    driver: "Yes, and I ensure it complies with FMCSA rules.",
    id: 156,
    isPremium: true
  },
  {
    officer: "Have you ever failed to secure a load properly?",
    driver: "No, I always follow load securement procedures.",
    id: 157,
    isPremium: true
  },
  {
    officer: "What's your emergency procedure for accidents?",
    driver: "First, I ensure safety, then report to dispatch and authorities.",
    id: 158,
    isPremium: true
  },
  {
    officer: "Do you use any fuel card or tracking program?",
    driver: "Yes, we use a company-issued fuel card with tracking.",
    id: 159,
    isPremium: true
  },
  {
    officer: "Do you know how to use your emergency brakes?",
    driver: "Yes, they're engaged when parked and in case of air loss.",
    id: 160,
    isPremium: true
  },
  {
    officer: "What do you do if your trailer lights stop working?",
    driver: "I pull over safely and check the fuse, wiring, or call for repair.",
    id: 161,
    isPremium: true
  },
  {
    officer: "Can you identify your truck's VIN number?",
    driver: "Yes, it's located on the dashboard and inside the door frame.",
    id: 162,
    isPremium: true
  },
  {
    officer: "What should you do during a jackknife situation?",
    driver: "Ease off the brakes and steer gently to regain control.",
    id: 163,
    isPremium: true
  },
  {
    officer: "Is your cargo temperature-controlled?",
    driver: "Yes, I'm using a reefer unit set to 34°F for frozen goods.",
    id: 164,
    isPremium: true
  },
  {
    officer: "When do you perform post-trip inspections?",
    driver: "At the end of every shift or delivery run.",
    id: 165,
    isPremium: true
  },
  {
    officer: "Are you aware of your trailer's swing radius?",
    driver: "Yes, I allow extra space when turning corners.",
    id: 166,
    isPremium: true
  },
  {
    officer: "Have you had your CDL endorsement for tankers?",
    driver: "Yes, I obtained the endorsement last year.",
    id: 167,
    isPremium: true
  },
  {
    officer: "Do you know how to read a weigh ticket?",
    driver: "Yes, I check axle weights and gross vehicle weight.",
    id: 168,
    isPremium: true
  },
  {
    officer: "Have you reviewed today's weather conditions?",
    driver: "Yes, I checked for rain and crosswind alerts.",
    id: 169,
    isPremium: true
  },
  {
    officer: "How do you respond if your trailer skids?",
    driver: "I steer in the direction of the skid and avoid braking hard.",
    id: 170,
    isPremium: true
  },
  {
    officer: "What's your tire inflation policy?",
    driver: "I check pressure daily and inflate to manufacturer specs.",
    id: 171,
    isPremium: true
  },
  {
    officer: "Do you conduct en route inspections?",
    driver: "Yes, every time I stop or after 150 miles.",
    id: 172,
    isPremium: true
  },
  {
    officer: "Do you use blind spot mirrors?",
    driver: "Yes, they're adjusted for both sides to reduce blind spots.",
    id: 173,
    isPremium: true
  },
  {
    officer: "Can you explain proper lane discipline for trucks?",
    driver: "Stay in the right lane unless overtaking or as posted.",
    id: 174,
    isPremium: true
  },
  {
    officer: "Do you monitor your DEF (Diesel Exhaust Fluid) level?",
    driver: "Yes, I refill as needed and watch for alerts on the dash.",
    id: 175,
    isPremium: true
  },
  {
    officer: "What steps do you take before backing up?",
    driver: "I walk the area, use flashers, and back slowly with caution.",
    id: 176,
    isPremium: true
  },
  {
    officer: "Do you inspect your air compressor daily?",
    driver: "Yes, it's part of my pre-trip air brake system check.",
    id: 177,
    isPremium: true
  },
  {
    officer: "What's the rule for following distance?",
    driver: "One second per 10 feet of vehicle length, plus more in bad weather.",
    id: 178,
    isPremium: true
  },
  {
    officer: "What's your carrier's contact info in case of emergency?",
    driver: "Yes, I have dispatch and safety team numbers in my phone.",
    id: 179,
    isPremium: true
  },
  {
    officer: "Do you use a dash cam while driving?",
    driver: "Yes, it's for safety and evidence in case of incidents.",
    id: 180,
    isPremium: true
  },
  {
    officer: "Have you reviewed your CSA score recently?",
    driver: "Yes, I checked last month and everything is clear.",
    id: 181,
    isPremium: true
  },
  {
    officer: "Do you ever drive under heavy rain or fog?",
    driver: "Yes, but I reduce speed and increase spacing immediately.",
    id: 182,
    isPremium: true
  },
  {
    officer: "How do you prevent rollovers on curves?",
    driver: "I slow down and stay below posted ramp speeds.",
    id: 183,
    isPremium: true
  },
  {
    officer: "What's your plan if you miss an off-ramp?",
    driver: "I continue to the next exit and reroute safely.",
    id: 184,
    isPremium: true
  },
  {
    officer: "Do you carry extra fuses and bulbs?",
    driver: "Yes, they're in my spare parts kit.",
    id: 185,
    isPremium: true
  },
  {
    officer: "Do you carry a printed copy of your route?",
    driver: "Yes, I have it as backup in case GPS fails.",
    id: 186,
    isPremium: true
  },
  {
    officer: "Do you use cruise control in bad weather?",
    driver: "No, I turn it off to maintain full control.",
    id: 187,
    isPremium: true
  },
  {
    officer: "Do you know the legal alcohol limit for CDL holders?",
    driver: "Yes, it's 0.04%, and zero tolerance while on duty.",
    id: 188,
    isPremium: true
  },
  {
    officer: "Are you trained to respond to hazmat spills?",
    driver: "Yes, I completed the required hazmat training.",
    id: 189,
    isPremium: true
  },
  {
    officer: "When do you log sleeper berth time?",
    driver: "Only when I'm resting in the cab's designated sleeper area.",
    id: 190,
    isPremium: true
  },
  {
    officer: "Do you carry a tire chain kit?",
    driver: "Yes, especially when crossing mountain passes in winter.",
    id: 191,
    isPremium: true
  },
  {
    officer: "Do you know your air brake cut-in and cut-out pressures?",
    driver: "Yes, cut-in around 85 psi and cut-out near 130 psi.",
    id: 192,
    isPremium: true
  },
  {
    officer: "Have you checked your trailer kingpin lock?",
    driver: "Yes, it's engaged and inspected before departure.",
    id: 193,
    isPremium: true
  },
  {
    officer: "Do you avoid tailgating even at low speeds?",
    driver: "Absolutely, I keep safe distance regardless of speed.",
    id: 194,
    isPremium: true
  },
  {
    officer: "How do you handle fatigue while driving?",
    driver: "I rest or pull over immediately if I feel drowsy.",
    id: 195,
    isPremium: true
  },
  {
    officer: "Is your seatbelt functioning properly?",
    driver: "Yes, I check it every morning before driving.",
    id: 196,
    isPremium: true
  },
  {
    officer: "Do you log fueling time in your ELD?",
    driver: "Yes, it's logged as On Duty, Not Driving.",
    id: 197,
    isPremium: true
  },
  {
    officer: "Do you have a backup GPS or map in case of failure?",
    driver: "Yes, I carry a Rand McNally atlas and backup app.",
    id: 198,
    isPremium: true
  }
];