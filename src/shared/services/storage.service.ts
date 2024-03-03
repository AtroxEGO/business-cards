import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

@Injectable()
export class StorageService implements OnModuleInit {
  private firebaseApp: FirebaseApp | undefined;
  private storage: FirebaseStorage;
  private logger = new Logger(StorageService.name);

  onModuleInit() {
    this.initApp();
  }

  private initApp() {
    this.firebaseApp = initializeApp(firebaseConfig);
    this.storage = getStorage(this.firebaseApp);
  }

  get app(): FirebaseApp {
    return this.firebaseApp;
  }

  async uploadFile(file: Buffer, folder: string, cardId: string) {
    const path = `${folder}/${cardId}.jpg`;
    const storageRef = ref(this.storage, path);

    try {
      const uploadTask = await uploadBytes(storageRef, file, {
        contentType: 'image/jpeg',
      });
      const downloadURL = await getDownloadURL(uploadTask.ref);

      this.logger.debug(`Uploaded file to ${path}\n${downloadURL}`);
      return downloadURL;
    } catch {
      throw new InternalServerErrorException('File upload failed');
    }
  }
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'business-cards-20bfb.firebaseapp.com',
  projectId: 'business-cards-20bfb',
  storageBucket: 'business-cards-20bfb.appspot.com',
  messagingSenderId: '508752212414',
  appId: '1:508752212414:web:83dd46c3e7d192ec3b09ef',
  measurementId: 'G-Q4JRXV04T7',
};
