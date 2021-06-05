import * as dotenv from 'dotenv';

dotenv.config();

class Env {
    nodeEnv = this.get('NODE_ENV');

    get(variable: string): string {
        return process.env[variable];
    }

    getFrontendBaseUrl(): string {
        if (this.nodeEnv === 'development') {
            return this.get('LOCAL_UI_BASEURL');
        }
        return this.get('REMOTE_UI_BASEURL');
    }

    getBackendUrl(): string {
        if (this.nodeEnv === 'development') {
            return this.get('BASE_URL_DEV');
        }
        return this.get('BASEURL_URL_PROD');
    }

    getFbOAuth(): object {
        return {
            clientID: this.get('FB_CLIENT_ID'),
            clientSecret: this.get('FB_CLIENT_ID_SECRET'),
            callbackURL: this.get('FB_CALLBACK'),
        }
    }

    getGoogleOAuth(): object {
        return {
            clientID: this.get('GOOGLE_CLIENT_ID'),
            clientSecret:  this.get('GOOGLE_SECRET'),
            callbackURL: this.get('GOOGLE_CALLBACK'),
        }
    }

    getTwitterOAuth(): object {
        return {
            consumerKey: this.get('TWITTER_CLIENT_ID'),
            consumerSecret: this.get('TWITTER_SECRET'),
            callbackURL: this.get('TWITTER_CALLBACK'),
        }
    }
}


export default new Env();