const functions = require('firebase-functions');
const {YoutubeTranscript} = require('youtube-transcript');

/**
 * Cloud Function to fetch YouTube transcripts
 *
 * Usage: GET /getTranscript?videoId=VIDEO_ID&lang=ja
 *
 * Example: https://YOUR_PROJECT.cloudfunctions.net/getTranscript?videoId=_znBmC-oZ1M&lang=ja
 */
exports.getTranscript = functions.https.onRequest(async (req, res) => {
    // Enable CORS for browser access
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Extract video ID and language from query parameters
    const videoId = req.query.videoId;
    const lang = req.query.lang || 'ja'; // Default to Japanese

    // Validate video ID
    if (!videoId) {
        res.status(400).json({
            success: false,
            error: 'Missing required parameter: videoId'
        });
        return;
    }

    try {
        console.log(`Fetching transcript for video: ${videoId}, language: ${lang}`);

        // Fetch the transcript from YouTube
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: lang
        });

        // Transform transcript into a more usable format
        const formattedTranscript = {
            videoId: videoId,
            language: lang,
            entries: transcript.map(entry => ({
                text: entry.text,
                offset: entry.offset,
                duration: entry.duration
            })),
            fullText: transcript.map(entry => entry.text).join(' ')
        };

        console.log(`Successfully fetched ${transcript.length} transcript entries`);

        res.status(200).json({
            success: true,
            data: formattedTranscript
        });

    } catch (error) {
        console.error('Error fetching transcript:', error);

        // Determine error type and return appropriate message
        let errorMessage = error.message;
        let statusCode = 500;

        if (error.message.includes('Transcript is disabled')) {
            errorMessage = 'Transcripts are disabled for this video';
            statusCode = 404;
        } else if (error.message.includes('Could not find')) {
            errorMessage = `No ${lang} transcript found for this video. Try a different language.`;
            statusCode = 404;
        } else if (error.message.includes('Video unavailable')) {
            errorMessage = 'Video is unavailable or does not exist';
            statusCode = 404;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            videoId: videoId
        });
    }
});

/**
 * Cloud Function to get available transcript languages for a video
 *
 * Usage: GET /getTranscriptLanguages?videoId=VIDEO_ID
 */
exports.getTranscriptLanguages = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const videoId = req.query.videoId;

    if (!videoId) {
        res.status(400).json({
            success: false,
            error: 'Missing required parameter: videoId'
        });
        return;
    }

    try {
        // Try to fetch available languages
        // Note: youtube-transcript package doesn't have a direct method for this,
        // so we'll try common languages
        const commonLanguages = ['ja', 'en', 'ko', 'zh-Hans', 'zh-Hant', 'es', 'fr', 'de'];
        const availableLanguages = [];

        for (const lang of commonLanguages) {
            try {
                await YoutubeTranscript.fetchTranscript(videoId, {lang: lang});
                availableLanguages.push(lang);
            } catch (error) {
                // Language not available, skip
            }
        }

        res.status(200).json({
            success: true,
            videoId: videoId,
            availableLanguages: availableLanguages
        });

    } catch (error) {
        console.error('Error checking languages:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
