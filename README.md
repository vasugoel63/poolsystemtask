For Backend - 

Step1-  I used npm init command . Then I installed dependencies such as express,pg I have created app and made it run on PORT 5000. 

Step2- Then I created a database using pgAdmin and connected to it using pg

Step3- Then I created tables for pools, pools_options, votes, and users

Step4- Then I created Api for creating users , made a signup api, created pool by user, getting single pool data. Also Used Postman for testing it.

Step5- My Next Step was first setting up Kafka and zookeeper. For that first I installed kafka on my device. Then using cmd ran kafka on server 9192 and zookeeper on server 2181

Step6- Then first created Topic named 'pool-system' using admin file under kafka directory. 

Step7- Then I made vote in pool api .Here I used kafka producer so as to send updated data to kafka for processing. Also updated the data in database

Step8- Then I first I installed ws dependency. Then I created wsServer in websocket.js file and initialised that in server.js file.

Step9- Then I made a consumer , subscribing to kafka topic, giving the updated data and sending data to websocket server. Using this websocket server we can show changes in frontend also. Helping us in real time updates.

Step10- Made Leaderboard api, where got the data from pools and votes result along with it. 

For runing and testing real-time poll updates and leaderboard feature-

API for voting- http://localhost:5000/polls/5/vote  

and request.body send in this api is 
{
    "optionid": "5",
    "userid": "9"
} 

So this will help in voting optionid 5 for questionid 5.

Now if I run ws://localhost:5000 in postman I will get vote result for question id 5 showing real time updates . So this how realtime updates will be shown
