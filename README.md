# AI Copywriting Platform with Brand Voice Consistency

A sophisticated AI-powered copywriting platform that maintains brand voice consistency across multiple marketing channels through intelligent matrix-based tone and voice management.

## Features

### 🎯 Core Features
- **Voice Matrix System**: Sophisticated sliders to define brand voice characteristics
- **Channel Optimization**: Generate copy optimized for different platforms (Email, LinkedIn, Instagram, Twitter, Web, Facebook, TikTok)
- **Real-time Consistency Scoring**: Get instant feedback on voice alignment
- **Brand Voice Learning**: Upload existing content samples to learn your brand voice
- **Performance Analytics**: Track copy performance and engagement

### 🎨 Voice Matrix Characteristics
- **Formal vs Casual**: Control the level of formality in your content
- **Authoritative vs Approachable**: Balance authority with approachability
- **Professional vs Conversational**: Adjust professionalism level
- **Serious vs Playful**: Control the tone from serious to playful
- **Confidence Level**: Adjust confidence in messaging
- **Enthusiasm Level**: Control enthusiasm and energy
- **Empathy Level**: Balance directness with empathy

### 📱 Supported Channels
- **Email**: Professional, actionable email copy
- **LinkedIn**: Industry-relevant, thought-provoking content
- **Instagram**: Engaging, visually-appealing posts
- **Twitter**: Concise, engaging tweets with hashtags
- **Web**: SEO-friendly, conversion-focused copy
- **Facebook**: Community-focused, shareable content
- **TikTok**: Trendy, entertaining short-form content

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini Flash 2.5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 22.17.0 or later
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd copy-matrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/copy_matrix"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Google Gemini API
   GEMINI_API_KEY="your-gemini-api-key-here"
   
   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Define Your Brand Voice
- Use the Voice Matrix sliders to define your brand characteristics
- Upload existing content samples to help the AI learn your voice
- Set brand guidelines for additional context

### 2. Generate Copy
- Select your target channel (Email, LinkedIn, Instagram, etc.)
- Enter your content prompt or idea
- Adjust the Voice Matrix to fine-tune the output
- Click "Generate Copy" to create channel-optimized content

### 3. Review and Refine
- Check the voice consistency score
- Review character count against channel limits
- Use the suggestions to improve your copy
- Copy or export the final content

## API Endpoints

### Generate Copy
```http
POST /api/generate-copy
Content-Type: application/json

{
  "prompt": "Your content idea",
  "channel": "email",
  "voiceMatrix": {
    "formalCasual": 0.5,
    "authoritativeApproachable": -0.3,
    "professionalConversational": 0.2,
    "seriousPlayful": -0.1,
    "confidence": 0.4,
    "enthusiasm": 0.6,
    "empathy": 0.3
  },
  "brandGuidelines": "Optional brand guidelines",
  "voiceSamples": "Optional voice samples",
  "characterLimit": 500
}
```

### Analyze Voice Consistency
```http
POST /api/analyze-voice
Content-Type: application/json

{
  "content": "Your content to analyze",
  "voiceMatrix": {
    // Your voice matrix values
  }
}
```

## Database Schema

The platform uses a comprehensive database schema with the following main entities:

- **Brands**: Store brand information and guidelines
- **Voice Profiles**: Define voice matrix configurations
- **Copy Generations**: Track generated content and performance
- **Templates**: Reusable prompt templates for different channels

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@copymatrix.com or join our Discord community.

## Roadmap

### Phase 1: MVP Foundation ✅
- [x] Core Voice Matrix system
- [x] Basic copy generation
- [x] Channel optimization
- [x] Real-time consistency scoring

### Phase 2: Advanced Features
- [ ] Brand voice learning from samples
- [ ] Performance analytics dashboard
- [ ] A/B testing framework
- [ ] Template management system

### Phase 3: Intelligence & Scale
- [ ] ML-powered optimization
- [ ] Predictive recommendations
- [ ] Export integrations
- [ ] Team collaboration features

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS