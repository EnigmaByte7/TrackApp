### TrackApp / Consignment Tracking
- Its an implementation of real time stream processing using apache kafka 
- to simulate real time consignment tracking
- ingests real time gps location from rider app (see repo)
- performs stream processing to find ETA
- pushes the changes to a redis pub/sub channel
- user app receives the changes via a SSE server
- spatial data stored in postgres + postgis managed via drizzle ORM
- app built is built on expo + React Native
- background + foreground location via expo-location

### Architecture
- see full design [here](https://excalidraw.com/#json=_YGt43JuXaAgYxr0hRpOI,SwSQLjurbP9uuQYt1pEFmQ)
- devices supported Android 11+

### Known issues
- background location may not work correctly on some devices and emulators due to an unresolved issue in expo-location read here [#33911](https://github.com/expo/expo/issues/33911)

### Screenshots

![s1](/assets/images/s1.jpg)
![s2](/assets/images/s2.jpg)
![s3](/assets/images/s3.jpg)
![s4](/assets/images/s4.jpg)
![s5](/assets/images/s5.jpg)
![s6](/assets/images/s6.jpg)