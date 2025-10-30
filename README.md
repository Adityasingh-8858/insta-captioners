# Instagram Caption Copier

A simple web application that allows users to paste an Instagram reel URL and copy the caption of that reel.

## Features

- 📸 Paste any Instagram reel URL
- 📋 Automatically fetch and display the caption
- ✂️ One-click copy to clipboard
- 🎨 Beautiful, responsive UI
- ⚡ Fast and easy to use

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Adityasingh-8858/insta-captioners.git
cd insta-captioners
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Open Instagram and find a reel you want to get the caption from
2. Click the share button on the reel and copy the link
3. Paste the link into the input field on the webapp
4. Click "Get Caption" button
5. Once the caption appears, click "Copy Caption" to copy it to your clipboard

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Dependencies**:
  - express - Web server framework
  - cors - Cross-origin resource sharing
  - axios - HTTP client for fetching Instagram data

## Important Notes

- This app uses Instagram's public endpoints to fetch captions
- Private accounts or posts won't be accessible
- Instagram may rate-limit requests if used excessively
- For production use, consider using Instagram's official Graph API with proper authentication

## License

ISC