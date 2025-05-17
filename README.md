While developing SkillScape we used macOS or Ubuntu on AWS so this is for those operating systems but Windows should be similar too.

**Database**

1 - Open terminal

2 - Install PostgreSQL 
    * macOS (we used homebrew) 
    brew update
    brew install postgresql
    * Ubuntu (or any Debian based Linux)
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    
3 - Start PostgreSQL
    * macOS
    brew services start postgresql
    * Ubuntu
    sudo systemctl start postgresql
    
4 - Access PostgreSQL 
    * macOS
    psql postgres
    * Ubuntu
    sudo -i -u postgres
    psql
    
5 - Create database
    CREATE USER skillscape_user WITH PASSWORD '';
    CREATE DATABASE skillscape_db OWNER skillscape_user;
    
6 - Set permissions
    GRANT ALL PRIVILEGES ON DATABASE skillscape_db TO skillscape_user;
    
7 - Quit
    \q

**Java Project - Maven**

Run 
"mvn clean compile spring-boot:run"
in the backend-new folder.

If it does not compile or run it is probably because database credentials in application.properties file under resources folder, make sure
username and password are correct. You can find dependencies we used in pom.xml file.

**Frontend**

In another terminal go to frontend folder enter the command (Python required)
"python3 -m http.server 8000"
or 
"python -m http.server 8000"

Now go to localhost:8000/landing.html in your browser

**AI Service**

In another terminal go to skillscape (project root) folder (Python required)
1 - Activate virtual python envoriment, run
    source venv/bin/activate
2 - run the AI service
    uvicorn ai_service:app --reload --port 5001
3 - Since we are using free services for AI, it is easy to hit limits. Also, normally we do not hard code API keys into our code, we use environment variables. The API key will expire in 1 week.

**Things you can do**
**Note: You can buy your own gigs/listing for quick testing purposes**
*Auth*
Login
Register
Reset Password (link will be in maven console)
Change Password

*Customer*
Create Listings
View/Remove Listings
Award Bids
See Orders
Browse Gigs
Order Gigs
AI while Ordering

*Freelancer*
Create Gigs
View/Remove Gigs
View Jobs
Browse Listings
Bid to Listings

*Other*
Upload Files
Download Files
Delete Account
Landing Page

**Technologies we used**

*Java*
Maven
- Spring Boot
  - Spring Boot JPA
  - Spring Boot Security
  - Spring Boot Validation
  - Spring Boot Web
  - Spring Boot Test
  - Spring Boot Security Test
- PostgreSQL
- Lombok
- JWT
  - JWT API
  - JWT IMPL
  - JWT Jackson

*Plain JavaScript*

*CSS & HTML*

*Python*
- FastAPI
- CORS
- Uvicorn
- OpenAI SDK
- Pydantic

    
