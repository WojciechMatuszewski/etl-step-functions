import { handler } from "./handler";
import { S3 } from "@aws-sdk/client-s3";

const s3Client = new S3({});

test("combines the data and produces the chunks", async () => {
  const nytKey = `nyt-test-${new Date().toISOString()}.json`;
  const hopkinsKey = `hopkins-test-${new Date().toISOString()}.json`;

  const promises = [nytKey, hopkinsKey].map(key =>
    s3Client.putObject({
      Body: bodyForKey(key),
      Key: key,
      Bucket: process.env.DATA_BUCKET_NAME
    })
  );

  await Promise.all(promises);

  const keysToCombine = [hopkinsKey, nytKey];

  const chunks = await handler(keysToCombine);

  expect(chunks).toHaveLength(2);
  expect(chunks[0]).toHaveLength(25);
  expect(chunks[1]).toHaveLength(10);
}, 100000);

function bodyForKey(key: string) {
  if (key.includes("nyt")) return JSON.stringify(nytEntries);

  return JSON.stringify(hopkinsEntries);
}

const nytEntries = [
  { date: "2020-11-26", cases: "12954324", deaths: "263336" },
  { date: "2020-11-27", cases: "13159786", deaths: "264748" },
  { date: "2020-11-28", cases: "13311031", deaths: "265940" },
  { date: "2020-11-29", cases: "13447369", deaths: "266758" },
  { date: "2020-11-30", cases: "13615129", deaths: "268023" },
  { date: "2020-12-01", cases: "13799415", deaths: "270633" },
  { date: "2020-12-02", cases: "14000601", deaths: "273518" },
  { date: "2020-12-03", cases: "14218560", deaths: "276375" },
  { date: "2020-12-04", cases: "14449741", deaths: "279012" },
  { date: "2020-12-05", cases: "14655498", deaths: "281202" },
  { date: "2020-12-06", cases: "14827657", deaths: "282313" },
  { date: "2020-12-07", cases: "15031799", deaths: "283846" },
  { date: "2020-12-08", cases: "15251704", deaths: "286667" },
  { date: "2020-12-09", cases: "15471382", deaths: "289824" },
  { date: "2020-12-10", cases: "15696634", deaths: "292761" },
  { date: "2020-12-11", cases: "15977148", deaths: "295712" },
  { date: "2020-12-12", cases: "16184592", deaths: "297971" },
  { date: "2020-12-13", cases: "16368840", deaths: "299328" },
  { date: "2020-12-14", cases: "16569913", deaths: "301006" },
  { date: "2020-12-15", cases: "16772913", deaths: "304031" },
  { date: "2020-12-16", cases: "17017946", deaths: "307642" },
  { date: "2020-12-17", cases: "17256391", deaths: "310940" },
  { date: "2020-12-18", cases: "17507582", deaths: "313810" },
  { date: "2020-12-19", cases: "17701529", deaths: "316371" },
  { date: "2020-12-20", cases: "17881485", deaths: "317800" },
  { date: "2020-12-21", cases: "18083055", deaths: "319763" },
  { date: "2020-12-22", cases: "18284729", deaths: "323002" },
  { date: "2020-12-23", cases: "18512479", deaths: "326413" },
  { date: "2020-12-24", cases: "18706036", deaths: "329237" },
  { date: "2020-12-25", cases: "18807030", deaths: "330366" },
  { date: "2020-12-26", cases: "19023888", deaths: "332012" },
  { date: "2020-12-27", cases: "19175990", deaths: "333242" },
  { date: "2020-12-28", cases: "19365034", deaths: "335141" },
  { date: "2020-12-29", cases: "19566140", deaths: "338769" },
  { date: "2020-12-30", cases: "19795489", deaths: "342577" }
];

const hopkinsEntries = [
  {
    Date: "2020-11-26",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "12951974",
    Recovered: "4871203",
    Deaths: "263532"
  },
  {
    Date: "2020-11-27",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "13156157",
    Recovered: "4947446",
    Deaths: "264958"
  },
  {
    Date: "2020-11-28",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "13312157",
    Recovered: "5023063",
    Deaths: "266170"
  },
  {
    Date: "2020-11-29",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "13450477",
    Recovered: "5065030",
    Deaths: "267012"
  },
  {
    Date: "2020-11-30",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "13607866",
    Recovered: "5146319",
    Deaths: "268165"
  },
  {
    Date: "2020-12-01",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "13791945",
    Recovered: "5226581",
    Deaths: "270753"
  },
  {
    Date: "2020-12-02",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "13992765",
    Recovered: "5322128",
    Deaths: "273528"
  },
  {
    Date: "2020-12-03",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "14212649",
    Recovered: "5404018",
    Deaths: "276371"
  },
  {
    Date: "2020-12-04",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "14442788",
    Recovered: "5470389",
    Deaths: "278965"
  },
  {
    Date: "2020-12-05",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "14658875",
    Recovered: "5576026",
    Deaths: "281222"
  },
  {
    Date: "2020-12-06",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "14840269",
    Recovered: "5624444",
    Deaths: "282344"
  },
  {
    Date: "2020-12-07",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "15030195",
    Recovered: "5714557",
    Deaths: "283763"
  },
  {
    Date: "2020-12-08",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "15249204",
    Recovered: "5786915",
    Deaths: "286283"
  },
  {
    Date: "2020-12-09",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "15471133",
    Recovered: "5889896",
    Deaths: "289347"
  },
  {
    Date: "2020-12-10",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "15698737",
    Recovered: "5985047",
    Deaths: "292267"
  },
  {
    Date: "2020-12-11",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "15933420",
    Recovered: "6135314",
    Deaths: "295550"
  },
  {
    Date: "2020-12-12",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "16152668",
    Recovered: "6246605",
    Deaths: "297904"
  },
  {
    Date: "2020-12-13",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "16344409",
    Recovered: "6298082",
    Deaths: "299293"
  },
  {
    Date: "2020-12-14",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "16538023",
    Recovered: "0",
    Deaths: "300777"
  },
  {
    Date: "2020-12-15",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "16735333",
    Recovered: "0",
    Deaths: "303761"
  },
  {
    Date: "2020-12-16",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "16982157",
    Recovered: "0",
    Deaths: "307443"
  },
  {
    Date: "2020-12-17",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "17219177",
    Recovered: "0",
    Deaths: "310789"
  },
  {
    Date: "2020-12-18",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "17468841",
    Recovered: "0",
    Deaths: "313610"
  },
  {
    Date: "2020-12-19",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "17665284",
    Recovered: "0",
    Deaths: "316159"
  },
  {
    Date: "2020-12-20",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "17853731",
    Recovered: "0",
    Deaths: "317668"
  },
  {
    Date: "2020-12-21",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "18045048",
    Recovered: "0",
    Deaths: "319364"
  },
  {
    Date: "2020-12-22",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "18239758",
    Recovered: "0",
    Deaths: "322765"
  },
  {
    Date: "2020-12-23",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "18466484",
    Recovered: "0",
    Deaths: "326124"
  },
  {
    Date: "2020-12-24",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "18665343",
    Recovered: "0",
    Deaths: "329023"
  },
  {
    Date: "2020-12-25",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "18765529",
    Recovered: "0",
    Deaths: "330246"
  },
  {
    Date: "2020-12-26",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "18992126",
    Recovered: "0",
    Deaths: "331909"
  },
  {
    Date: "2020-12-27",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "19142603",
    Recovered: "0",
    Deaths: "333118"
  },
  {
    Date: "2020-12-28",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "19309281",
    Recovered: "0",
    Deaths: "334836"
  },
  {
    Date: "2020-12-29",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "19511426",
    Recovered: "0",
    Deaths: "338568"
  },
  {
    Date: "2020-12-30",
    "Country/Region": "US",
    "Province/State": "",
    Confirmed: "19740468",
    Recovered: "0",
    Deaths: "342312"
  }
];
