import Appsignal from '@appsignal/javascript';

const appsignal = new Appsignal({
  key: process.env['APPSIGNAL_FRONT_END_KEY'],
  revision: process.env['APPSIGNAL_REVISION_SHA']
});

window.appsignal = appsignal

console.log("Some test JavaScript")

appsignal.wrap(() => { throw new Error("sourcemaps test") })

