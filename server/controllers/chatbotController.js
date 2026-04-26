const Anthropic = require("@anthropic-ai/sdk").default || require("@anthropic-ai/sdk");
const PG = require("../models/PG");
const Room = require("../models/Room");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");

const client = new Anthropic();

// Fetch website context data for the AI
async function getWebsiteContext() {
  try {
    const totalPGs = await PG.countDocuments({ isActive: true });
    const totalRooms = await Room.countDocuments();
    const totalReviews = await Review.countDocuments({ isApproved: true });
    const cities = await PG.distinct("address.city", { isActive: true });
    const avgRating =
      (
        await Review.aggregate([
          { $match: { isApproved: true } },
          { $group: { _id: null, avgRating: { $avg: "$overallRating" } } },
        ])
      )[0]?.avgRating || 0;

    // Get popular cities
    const cityCounts = await PG.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$address.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get price range
    const priceStats = await PG.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$minPrice" },
          maxPrice: { $max: "$maxPrice" },
        },
      },
    ]);

    return {
      totalPGs,
      totalRooms,
      totalReviews,
      cities,
      avgRating: avgRating.toFixed(1),
      cityCounts: cityCounts.map((c) => `${c._id} (${c.count} PGs)`),
      priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0 },
      amenitiesAvailable: [
        "WiFi",
        "AC",
        "Attached Bathroom",
        "Study Table",
        "Wardrobe",
        "Kitchen Access",
        "Washing Machine",
        "Parking",
        "CCTV",
        "Power Backup",
      ],
      genderPolicies: ["Boys", "Girls", "Family-Couple", "Mixed"],
    };
  } catch (error) {
    console.error("Error fetching website context:", error);
    return {};
  }
}

// Fetch sample PG details for context
async function getSamplePGDetails(limit = 3) {
  try {
    const pgs = await PG.find({ isActive: true })
      .select("name address price minPrice maxPrice amenities rooms")
      .limit(limit)
      .lean();

    return pgs.map((pg) => ({
      name: pg.name,
      city: pg.address?.city,
      price: `₹${pg.minPrice} - ₹${pg.maxPrice}`,
      amenities: pg.amenities?.slice(0, 5).join(", "),
      rooms: pg.rooms?.length || 0,
    }));
  } catch (error) {
    console.error("Error fetching sample PGs:", error);
    return [];
  }
}

// Build system prompt with website knowledge
async function buildSystemPrompt() {
  const context = await getWebsiteContext();
  const samplePGs = await getSamplePGDetails(3);

  return `You are ApnaPG Assistant, a friendly and helpful chatbot for the ApnaPG website - a platform for finding PG accommodations and booking rooms.

WEBSITE INFORMATION:
- Total Active PGs: ${context.totalPGs}
- Total Rooms: ${context.totalRooms}
- Total Reviews: ${context.totalReviews}
- Average Rating: ${context.avgRating}/5
- Popular Cities: ${context.cityCounts?.join(", ") || "Pune, Mumbai, Delhi"}
- Price Range: ₹${context.priceRange?.minPrice || 3000} - ₹${context.priceRange?.maxPrice || 25000}
- Supported Cities: ${context.cities?.join(", ") || "Pune, Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Ahmedabad"}
- Available Amenities: ${context.amenitiesAvailable?.join(", ")}
- Gender Policies: ${context.genderPolicies?.join(", ")}

SAMPLE LISTINGS:
${samplePGs
  .map(
    (pg) => `- ${pg.name} in ${pg.city}: ${pg.price} (${pg.rooms} rooms, Amenities: ${pg.amenities})`
  )
  .join("\n")}

YOUR RESPONSIBILITIES:
1. Help users find PG accommodations by asking about their preferences (city, budget, gender policy, amenities)
2. Provide information about booking process, room types, and pricing
3. Answer questions about house rules, amenities, and policies
4. Guide users on how to register, login, or create listings
5. Help with general questions about the ApnaPG platform
6. Be friendly, concise, and helpful
7. Suggest relevant filters or search options when appropriate

WHEN ANSWERING:
- Be conversational and warm
- If asked about specific features, explain how they work on ApnaPG
- For pricing/availability questions, explain they should browse or contact owners
- Suggest exploring the Browse section for detailed listings
- Offer to help with step-by-step guidance for bookings or account creation
- Keep responses concise (2-3 sentences typically)

Remember: You are representing ApnaPG. Be helpful, professional, and user-friendly.`;
}

// Main chatbot endpoint
const chatbotChat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn(
        "ANTHROPIC_API_KEY not set. Using fallback responses. To use AI, set ANTHROPIC_API_KEY in .env"
      );
      return res.json({
        reply: await getFallbackResponse(message),
        status: "fallback",
      });
    }

    const systemPrompt = await buildSystemPrompt();

    // Build messages array for API
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.from === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages,
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    res.json({
      reply,
      status: "success",
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    // Fallback to basic response if AI fails
    if (error.status === 401) {
      return res.status(401).json({
        error: "Invalid API Key. Check ANTHROPIC_API_KEY in server .env",
      });
    }

    res.json({
      reply: await getFallbackResponse(req.body.message),
      status: "fallback",
    });
  }
};

// Fallback responses when AI is not available
async function getFallbackResponse(message) {
  const lower = message.toLowerCase();

  // Greetings
  if (lower.match(/\b(hello|hi|hey|greetings|namaste|good morning|good afternoon|good evening)\b/i)) {
    return "Hello! 👋 Welcome to ApnaPG! I'm your AI assistant. I can help you with:\n• Finding PGs in different cities\n• Booking rooms\n• Learning about amenities and pricing\n• Account registration\n• General questions about our platform\n\nWhat would you like to know?";
  }

  // Questions about payment/cancellation/refund (check BEFORE booking)
  if (lower.match(/\b(payment|pay|cancel|cancellation|refund|money|deposit|advance)\b/i)) {
    return "💳 **Payment & Cancellation:**\n• Payment details are confirmed at booking\n• Contact the PG owner directly for payment methods\n• **Cancellation Policy:** Subject to owner's terms\n• Refunds processed as per agreement\n• Request cancellation through 'My Bookings'\n\n📞 For issues, contact the PG owner directly!";
  }

  // Questions about registration/account
  if (lower.match(/\b(register|sign up|account|create account|new user|how to register)\b/i)) {
    return "📝 **How to Register:**\n1. Click 'Sign Up' button at top right\n2. Enter your email and create a password\n3. Choose your role: **User** (looking for PG) or **Owner** (listing PGs)\n4. Complete your profile with basic info\n5. Verify your email\n\nOnce registered, you can start browsing or listing PGs!";
  }

  // Questions about login
  if (lower.match(/\b(login|sign in|log in|forgot password|reset password)\b/i)) {
    return "🔐 **Login & Password:**\n1. Click '🔑 Login' button at top right\n2. Enter your registered email and password\n3. **Forgot password?** Click 'Forgot Password' link\n4. Enter your email to receive reset link\n5. Create a new password\n\nStay signed in for easy browsing!";
  }

  // Questions about booking
  if (lower.match(/\b(book|booking|reserve|reservation)\b/i)) {
    return "🏠 **How to Book a Room:**\n1. Use **Browse PGs** to find listings\n2. Filter by city, price, gender policy, amenities\n3. Click on a PG to see details and available rooms\n4. Click **Book Now** on the room you want\n5. Fill in your details and submit\n6. **Owner will approve** and you're confirmed!\n\n💡 Tip: Check the room details and house rules before booking!";
  }

  // Questions about pricing/budget
  if (lower.match(/\b(price|pricing|cost|budget|afford|how much|rent|rupees|rate|fees)\b/i)) {
    return "💰 **Pricing Information:**\n• **Price Range:** ₹3,000 - ₹25,000+ per month\n• Varies by: Location, room type, amenities\n• **Popular Budget Options:**\n  - Budget: ₹3,000 - ₹7,000\n  - Mid-range: ₹7,000 - ₹12,000\n  - Premium: ₹12,000+\n\nFilter by price in Browse section to find your budget!";
  }

  // Questions about amenities/facilities
  if (lower.match(/\b(amenity|amenities|facility|facilities|wifi|ac|parking|cctv|washing|attached)\b/i)) {
    return "🛏️ **Available Amenities:**\n• WiFi & Internet\n• Air Conditioning\n• Attached Bathrooms\n• Study Table & Chair\n• Wardrobe/Storage\n• Kitchen Access\n• Washing Machine\n• Parking Space\n• CCTV & Security\n• Power Backup\n\nYou can filter by amenities in the Browse section!";
  }

  // Questions about room types
  if (lower.match(/\b(room type|single room|double room|triple|quad|dormitory|shared|private)\b/i)) {
    return "🏘️ **Room Types Available:**\n• **Single Room:** Private room for one person\n• **Double Room:** Shared room for two people\n• **Triple Room:** Shared room for three people\n• **Quad Room:** Shared room for four people\n• **Dormitory:** Large shared space for multiple people\n\nEach has different pricing. Browse listings to compare!";
  }

  // Questions about cities/locations
  if (lower.match(/\b(city|location|where|pune|mumbai|delhi|bangalore|hyderabad|cities available)\b/i)) {
    return "🌍 **Cities We Serve:**\n• **Pune**\n• **Mumbai**\n• **Delhi**\n• **Bangalore**\n• **Hyderabad**\n• **Chennai**\n• **Kolkata**\n• **Ahmedabad**\n\nUse the **Browse PGs** section to see listings in any city!";
  }

  // Questions about gender policy
  if (lower.match(/\b(gender|girls only|boys only|boys|girls|women|men|family|couple|mixed)\b/i)) {
    return "👥 **Gender Policies Available:**\n• **Girls Only:** For female residents only\n• **Boys Only:** For male residents only\n• **Family/Couple:** For families or couples\n• **Mixed:** Welcome to all genders\n\n✅ Gender policy is strictly enforced for safety and comfort.\n\nFilter by gender policy when searching!";
  }

  // Questions about verification
  if (lower.match(/\b(verify|verified|verification|safety|secure|trusted|authentic)\b/i)) {
    return "✅ **Verification & Safety:**\n• All PGs are verified before listing\n• Owner details are authenticated\n• User reviews are genuine\n• **Safety Features:** CCTV, 24/7 Security in many PGs\n• **Gender-based Protection:** Gender policies enforced\n• Report any issues to our support team\n\n💡 Always read reviews before booking!";
  }

  // Questions about one-day stays
  if (lower.match(/\b(one day|1 day|single night|short stay|temporary|exam|urgent)\b/i)) {
    return "📅 **One-Day Stays:**\n✨ Yes, we offer **one-day room bookings**!\n• Perfect for exams or urgent needs\n• Pay for just one night\n• Same process as regular booking\n• Confirm with PG owner\n\n💡 Filter PGs that allow daily bookings in Browse section!";
  }

  // Questions about owner/PG listing
  if (lower.match(/\b(owner|list my pg|add pg|create listing|become owner|add property)\b/i)) {
    return "🏢 **List Your PG:**\n1. Register as an **Owner**\n2. Go to **Add PG** in your dashboard\n3. Enter PG details: name, location, contact\n4. Add rooms with pricing and amenities\n5. Upload room photos\n6. Set your policy (gender, booking terms, etc.)\n7. Start receiving bookings!\n\n💡 Manage everything from your Owner Dashboard!";
  }

  // Questions about reviews/ratings
  if (lower.match(/\b(review|rating|stars|feedback|comment|opinion)\b/i)) {
    return "⭐ **Reviews & Ratings:**\n• Users can rate PGs after their stay\n• Reviews help other users decide\n• Ratings are 1-5 stars\n• Leave honest feedback about your experience\n• Read reviews before booking\n• Average rating shown on each listing\n\n💡 Your feedback helps improve our community!";
  }

  // Questions about my bookings
  if (lower.match(/\b(my booking|view booking|check booking|booking status|my reservation)\b/i)) {
    return "📋 **View Your Bookings:**\n1. Log in to your account\n2. Click **'My Bookings'** in navigation\n3. See all your bookings (pending, confirmed, completed)\n4. Check check-in/checkout dates\n5. Contact owner if needed\n6. Leave review after checkout\n\n💡 All booking details and owner contact info available there!";
  }

  // Questions about support/help/contact
  if (lower.match(/\b(support|help|contact|customer service|problem|issue|complaint|help desk)\b/i)) {
    return "📞 **Need Help?**\n• Browse our **Help & FAQ** section\n• Contact the **PG Owner** directly for booking issues\n• Report problems or violations\n• Check your **My Bookings** page\n• Read the complete **User Guide**\n\n💡 Most issues are best resolved by contacting the PG owner directly!";
  }

  // Questions about safety/security
  if (lower.match(/\b(safe|security|police|emergency|dangerous|accident|harm)\b/i)) {
    return "🔒 **Safety & Security:**\n• All PGs verified before listing\n• Gender policies strictly enforced\n• Many have CCTV surveillance\n• 24/7 security in premium PGs\n• Fire safety equipment required\n• Share your location with trusted contacts\n• Report any issues immediately\n\n💡 Your safety is our priority!";
  }

  // Questions about what is Apna PG
  if (lower.match(/\b(what is apna pg|about apna pg|who are you|introduce|platform|what do you do)\b/i)) {
    return "🏠 **About Apna PG:**\nApnaPG is a platform to find affordable PG accommodations:\n• **For Students & Professionals:** Easy booking system\n• **For PG Owners:** Reach customers directly\n• **Safe & Verified:** All listings are authenticated\n• **Gender-Based Policies:** Ensures safety\n• **One-Day Stays:** Perfect for exams or temporary needs\n• **Affordable Pricing:** ₹3,000 to ₹25,000+\n\n🌟 Your perfect PG is just a few clicks away!";
  }

  // Questions about browsing/searching
  if (lower.match(/\b(browse|search|filter|find|looking for|how to find)\b/i)) {
    return "🔍 **How to Search & Browse:**\n1. Click **'Browse PGs'** button\n2. **Filters available:**\n   • City\n   • Budget (price range)\n   • Gender policy\n   • Amenities\n   • Room type\n3. Sort by price, rating, or recent\n4. Click on PG to see full details\n5. Check reviews and photos\n6. Book your choice!\n\n💡 Use filters to narrow down options!";
  }

  // Generic helpful response
  return "👋 **I'm here to help!** I can assist with:\n✓ Finding PGs in different cities\n✓ Booking rooms\n✓ Pricing & budget information\n✓ Amenities & room types\n✓ Account & registration help\n✓ Payment & cancellation\n✓ Safety & verification\n✓ One-day stays\n\n📝 Try asking me anything about ApnaPG or type a specific question!";
}

module.exports = {
  chatbotChat,
};
