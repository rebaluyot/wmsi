Using react-native-bluetooth-escpos-printer

1. Run "npx expo run:android" to expose android folder
2. Install "yarn add react-native-bluetooth-escpos-printer"
3. Install "yarn add patch-package"
4. Do the manula linking as stated on readme

Manual linking (Android)
Ensure your build files match the following requirements:

(React Native 0.59 and lower) Define the react-native-bluetooth-escpos-printer project in android/settings.gradle:

include ':react-native-bluetooth-escpos-printer'
project(':react-native-bluetooth-escpos-printer').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-bluetooth-escpos-printer/android')

(React Native 0.59 and lower) Add the react-native-bluetooth-escpos-printer as an dependency of your app in android/app/build.gradle:
...
dependencies {
  ...
  implementation project(':react-native-bluetooth-escpos-printer')
}

(React Native 0.59 and lower) Add 
import cn.jystudio.bluetooth.RNBluetoothEscposPrinterPackage; 

and new RNBluetoothEscposPrinterPackage() in your MainApplication.java :

5. Change node-modules/react-native-bluetooth-escpos-printer files
a. android / build.gradle
   - 
buildscript {
    repositories {
        maven {url "https://repo.spring.io/plugins-snapshot/"}
        mavenCentral()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
        maven {
            url 'https://maven.google.com'
        }
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:3.1.4'
    }
}

apply plugin: 'com.android.library'

android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"

    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }
    lintOptions {
        abortOnError false
    }
    sourceSets {
        main {
            aidl.srcDirs = ['src/main/java']
        }
    }
}

repositories {
    maven {url "https://repo.spring.io/plugins-snapshot/"}
    mavenCentral()
    maven {
        // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
        url "$rootDir/../node_modules/react-native/android"
    }
    maven {
        url 'https://maven.google.com'
    }
}

dependencies {
    //compile fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'com.facebook.react:react-native:+'  // From node_modules
    implementation group: 'com.android.support', name: 'support-v4', version: '27.0.0'
    implementation "com.google.zxing:core:3.3.0"
}

b. android/src/main/java/RNBluetoothManageModule.java
replace old imports with these

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;


6. patch the react-native-bluetooth-escpos-printer
“npx patch-package react-native-bluetooth-escpos-printer”

7. test on emulator 
"npx expo run:android"

8. build apk
"npx eas build -p android -profile preview



All the steps below i have done in the video.
------------------------------------------------------


1)remove the jcenter in “node_modules\react-native-bluetooth-escpos-printer\android\build.gradle” update the links “https//repo.spring.io/plugins-release/” for "https/ /repo.spring.io/plugins-snapshot/”
and add the repository “gradlePluginPortal()”

2)once that is done install “patch-package”



3)After use “npm install patch-package” in your project
add in your package.json

"scripts": {
   .
   .
    "postinstall": "patch-package",
}


4)then use
“npx patch-package react-native-bluetooth-escpos-printer”



change EAS.json
----------------
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}