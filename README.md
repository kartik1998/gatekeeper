## G𝕒te𝕜ee𝕡er

[![Build Status](https://github.com/kartik1998/gatekeeper/actions/workflows/test.yml/badge.svg)](https://github.com/kartik1998/gatekeeper/actions/workflows/test.yml)

Capture your [webhooks](https://sendgrid.com/blog/whats-webhook) in your integration / end to end tests and write assertions for them.
Normally to test webhooks `webhook.site` or some similar platform is used, however you can't automate and write assertions over the data recieved through these webhooks. <br/>
P.S postman also offers a solution [link](https://learning.postman.com/docs/running-collections/collection-webhooks/) but I found the workflow a little time consuming.
Gatekeeper solves this problem via node's event emitter module and makes writing tests for webhooks seamless. [Sample gatekeeper webhook tests with chai, mocha and supertest](https://github.com/kartik1998/gatekeeper/blob/master/test/appModule.test.js)
