import axios from "axios";
//https://remotive.com/api/remote-jobs this
//https://remoteok.com/api
//https://himalayas.app/jobs/api  this
//https://jobdataapi.com/api/jobs/
class Job {
  static globalJob: any[] = [];
  static async getRemoteOkJobs() {
    try {
      /* const res = await axios.get("https://us19.api.mailchimp.com/3.0/", {
        headers: {
          Authorization: `Bearer `,
        },
      });
      console.log(res.statusText);*/
      // return res.data;
    } catch (err: unknown) {
      console.error("Failed to fetch:", (err as unknown).message);
      return null;
    }
  }
}
//"caf5c8a29e40a997b05124e1ea68c445
// -us19",

export default Job;

// Using fetch API
fetch("", {
  headers: {
    "X-Auth-Token": "api-key YOUR_ACTUAL_KEY_HERE",
  },
});

/**
 *   const res = await axios.get("https://api.getresponse.com/v3/contacts", {
      0xfus124foucowgog6v825fpm4qtdo64",
        },
      });
 */
