HOW TO USE
==========

In your ```/backend```, edit your .env file and add the following line:

```KURKI_URL = "http://localhost:3002"``` (fake-Kurki) or
```KURKI_URL = "https://opetushallinto.cs.helsinki.fi"``` (real-Kurki)

Tip: you can add both and comment the one you don't use with ```#```

Please note that backend admin page shows a duplicate for each course when using fake-Kurki.

This is a feature, not a bug, caused by the backend making two requests: first for the current term and then for the next. The date functionality of the real thing is not implemented in this version, so we get all the courses twice.

If you experience unusual behaviour of the app while using fake-Kurki, try clearing the local storage.
