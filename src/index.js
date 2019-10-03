import Appsignal from '@appsignal/javascript';

const appsignal = new Appsignal({
  key: '<API KEY HERE>',
});

window.appsignal = appsignal

console.log("Some test JavaScript")

appsignal.wrap(() => { throw new Error("sourcemaps test") })

