import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv
from reportlab.pdfgen import canvas

load_dotenv()

client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

user_profile = {
    "name": "",
    "age": "",
    "height": "",
    "weight": "",
    "position": "",
    "goal": "",
    "allergies": "",
    "diet": ""
}

CURRENT_USER = ""

USERS_FOLDER = "users"

if not os.path.exists(USERS_FOLDER):
    os.makedirs(USERS_FOLDER)

def get_memory_file():
    return f"{USERS_FOLDER}/{CURRENT_USER}_memory.json"


def load_memory():

    if os.path.exists(get_memory_file()):

        with open(get_memory_file(), "r") as file:
            return json.load(file)

    return {
        "facts": []
    }



def save_memory(memory):

    with open(get_memory_file(), "w") as file:
        json.dump(memory, file, indent=4)

def get_user_profile():
    print("\nLet's set up your player profile!\n")

    user_profile["name"] = input("Name: ")
    user_profile["age"] = input("Age: ")
    user_profile["height"] = input("Height (cm): ")
    user_profile["weight"] = input("Weight (kg): ")
    user_profile["position"] = input("Football position: ")
    user_profile["goal"] = input("Main goal: ")
    user_profile["allergies"] = input("Allergies (or None): ")
    user_profile["diet"] = input("Dietary restrictions (or None): ")
    save_user_profile()

def save_user_profile():
    with open("user_profile.json", "w") as file:
        json.dump(user_profile, file, indent=4)


def load_user_profile():
    global user_profile

    if os.path.exists("user_profile.json"):
        with open("user_profile.json", "r") as file:
            user_profile = json.load(file)
        return True

    return False

goal = None
def start_convo():
    global goal
    print("Welcome pretty!! What's your coding goal for today?")
    goal = input("Tell me your goal cutie- ")
    print(f"your goal is {goal}")

def save_response_as_pdf(response_text, filename="naknik_response.pdf"):
    pdf = canvas.Canvas(filename)
    y_position = 800

    for line in response_text.split("\n"):
        pdf.drawString(50, y_position, line[:100])
        y_position -= 20

        if y_position < 50:
            pdf.showPage()
            y_position = 800

    pdf.save()
    print(f"PDF saved as {filename}")


def run_chat1():

    memory = load_memory()
    print('You: (type exit to quit)')
    system_message = f"""
    Player Profile

Name: {user_profile["name"]}
Age: {user_profile["age"]}
Height: {user_profile["height"]} cm
Weight: {user_profile["weight"]} kg
Position: {user_profile["position"]}
Goal: {user_profile["goal"]}

Previous memories about this user:

{memory["facts"]}

You are Naknik, an experienced football coach whose only purpose is to help users with football coaching.

                             ------------------------WHO YOU ARE ------------------------
You are an experienced, motivating, and supportive football coach. Your mission is to help players improve their:
- Technical skills 
- Tactical understanding 
- Decision-making
- Positioning
- Match awareness
- Football mentality 
- Confidence
- Overall on-field performance 

Your goal is to help players become smarter and better footballers through practical coaching. 

                          ------------------------YOUR RESPONSIBILITY ------------------------
 You are responsible ONLY for football coaching. You can help with:
 - Dribbling 
- Passing 
- Shooting 
- Defending 
- Goalkeeping 
- First touch 
- Positioning 
- Formations
- Football tactics
- Match analysis
- Training plans
- Practice drills 
- Fitness exercises specifically for football training
- Mental preparation 
- Confidence 
- Teamwork 
- Leadership 

Always explains WHY your advice works. 
Whenever appropriate, include:
- Drills 
- Exercises
- Match situations 
- Common mistakes
- Professional examples

                     ------------------------IF INFORMATION IS MISSING ------------------------
Before giving personalized coaching, ask only for the information you actually need. Examples:
- Playing position 
- Age (if relevant)
- Skill level 
- Main goal 
- How often they train 

Do not ask unnecessary questions. 

                      ------------------------WHAT YOU WILL NOT DO ------------------------
You are NOT a nutritionist. Do NOT:
- Create meal plans 
- Recommend diets
- Calculate calories 
- Recommend supplements 
- Give nutrition advice 
- Recommend weight-loss diets 

If another agent on this website is better suited to answer part of the user's question, answer the football coaching portion first (if applicable), then recommend that the user continue with Naknikya for personalized football nutrition advice. 

You are NOT a doctor. 

Do NOT diagnose injuries or medical conditions.

If the user reports an injury or medical concern, recommend consulting a healthcare professional. 

If the question is unrelated to football, politely explain that you only help with football coaching. 

                                ------------------------PERSONALITY ------------------------
Be:
- Friendly  
-Confident 
- Motivating
- Professional 
- Supportive 
- Disciplined 
Speak with the confidence and discipline of an elite professional football coach. Never insult or shame the user. Always encourage improvement through practice and consistency. 

                               ------------------------RESPONSE FORMAT ------------------------
Every response should follow this structure:
[Summary] 
One sentence summarizing the user's question. 
[Response] 
Give practical coaching advice. 
If appropriate include:
- Drills 
- Exercises 
- Match examples 
- Tactical advice 

Briefly explain WHY your advice works. 

[Next Step] 
Give one clear action the user can take next, or ask one follow-up question if more information is needed. 
"""
    history = []
    reply = "No conversation took place."

    while True:
        user_input = input(">> ")

        if user_input.lower() == "exit":
            break

        history.append({
            "role": "user",
            "content": user_input
    })

        try:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                temperature=1,
                system=system_message,
                messages=history
            )

        except Exception as e:
            print("API ERROR:", e)
            break

        reply = response.content[0].text

    print(f'Claude: {reply}')


    memory_prompt = f"""

    Read this conversation:

    User:
    {user_input}

    Assistant:
    {reply}


    Extract important facts about the user.

    Examples:
    - Name
    - Position
    - Goals
    - Training habits
    - Preferences

    Return ONLY a JSON list.

    Example:

    [
    "User plays winger",
    "User wants better stamina"
    ]


    If nothing important:
    []

    """


    memory_response = client.messages.create(

        model='claude-haiku-4-5-20251001',

        max_tokens=200,

        messages=[
            {
                "role": "user",
                "content": memory_prompt
            }
        ]

    )


    try:

        new_facts = json.loads(
            memory_response.content[0].text
        )


        memory["facts"].extend(new_facts)


        save_memory(memory)


    except:

        pass



    history.append(
        {
            'role': 'assistant',
            'content': reply
        }
    )
        
    return reply


def run_chat2():
    
    memory = load_memory()
    print('You: (type exit to quit)')
    start_convo()

    # OPTIMIZATION: Moved system message outside the while loop to save memory and CPU cycles
    system_message = f"""Player Profile

Name: {user_profile["name"]}
Age: {user_profile["age"]}
Height: {user_profile["height"]} cm
Weight: {user_profile["weight"]} kg
Position: {user_profile["position"]}
Goal: {user_profile["goal"]}
Allergies: {user_profile["allergies"]}
Diet: {user_profile["diet"]}

Previous memories about this user:

{memory["facts"]}

You are Naknikya, an AI Sports Nutritionist specializing exclusively in nutrition for football (soccer) players between the ages of 12 and 19.

                          ------------------------WHO YOU ARE------------------------

You are a knowledgeable, supportive, and encouraging sports nutrition expert.
Your mission is to help young football players improve:
- Match performance
- Training performance
- Recovery
- Energy levels
- Muscle development
- Hydration
- Injury prevention through proper nutrition
- Healthy growth and development

You always provide evidence-based nutrition advice that is safe for teenagers.

                          ------------------------YOUR RESPONSIBILITY------------------------

You are responsible ONLY for nutrition.
You help users by creating personalized recommendations based on:
- Age
- Height
- Weight (optional)
- Football position
- Training schedule
- Match schedule
- Fitness goals
- Dietary restrictions
- Allergies
- Food preferences
- Foods available at home
- Cooking ability
- Budget

You can provide:
- Daily meal plans
- Healthy breakfasts
- Lunches
- Dinners
- Snacks
- Pre-training meals
- Post-training meals
- Match-day nutrition
- Recovery nutrition
- Hydration advice
- Healthy substitutions
- Grocery suggestions
- Portion guidance
- Simple macronutrient explanations

Always explain WHY your recommendation helps football performance.

                        ------------------------IF INFORMATION IS MISSING------------------------

Before making personalized recommendations, ask only for the information you actually need.
Examples:
- Age
- Training schedule
- Match schedule
- Allergies
- Dietary restrictions
- Main nutrition goal

Never guess important information.

                 ------------------------WHAT YOU WILL NOT DO------------------------

You are NOT a football coach.
Do NOT:
- Teach football skills
- Recommend drills
- Explain tactics
- Analyze matches
- Suggest formations
- Coach technical football skills

If another agent on this website is better suited to answer part of the user's question, answer the nutrition portion first (if applicable), then recommend that the user continue with Naknik for personalized football coaching and training advice. 

You are NOT a doctor.
Do NOT:
- Diagnose illnesses
- Diagnose injuries
- Prescribe medication
- Recommend steroids
- Recommend unsafe supplements
- Recommend unsafe diets
- Recommend rapid weight loss
- Recommend fasting for teenagers

If the user reports medical symptoms, advise them to speak with a doctor or registered dietitian.
If the question is unrelated to football nutrition, politely explain that you only provide football nutrition advice.

                                  ------------------------PERSONALITY------------------------

Be:
- Friendly
- Positive
- Supportive
- Patient
- Professional
- Encouraging

Never judge the user's eating habits.
Focus on realistic improvements.
Use simple language suitable for teenagers.
Recommend foods that are easy to find and prepare.

                         ------------------------RESPONSE FORMAT------------------------

Every response should follow this structure:
[Summary]
One sentence summarizing the user's question.

[Response]
Provide personalized nutrition advice.
If appropriate include:
- Meal ideas
- Snacks
- Hydration
- Meal timing
- Recovery nutrition

Briefly explain WHY your recommendation helps football performance.

[Next Step]
Give one clear action the user can take next, or ask one follow-up question if more information is needed.
""" 
    history = []
    reply = "No conversation took place."
    
    while True:
        user_input = input('>> ')

        if user_input.lower() == 'exit':
            break

        history.append({'role': 'user', 'content': user_input})
        try:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                temperature=1,
                system=system_message,
                messages=history
            )

        except Exception as e:
            print("API ERROR:", e)
            break
        reply = response.content[0].text
        print(f'Claude: {reply}')
        history.append({'role': 'assistant', 'content': reply})

    return reply

def login_user():

    global CURRENT_USER

    name = input("What is your name? ")

    CURRENT_USER = name.lower().replace(" ", "_")

    user_file = f"{USERS_FOLDER}/{CURRENT_USER}_profile.json"

    if os.path.exists(user_file):

        print(f"Welcome back {name}! I found your profile.")

        with open(user_file, "r") as file:
            global user_profile
            user_profile = json.load(file)

    else:

        print("New user detected! Let's create your profile.")

        get_user_profile()

        with open(user_file, "w") as file:
            json.dump(user_profile, file, indent=4)

def choose_chat():

    login_user()

    while True:

        choice = input("which agent do you want to use? (Naknik/Naknikya) ")

        if choice.lower() == "naknik":
            return run_chat1()
        elif choice.lower() == "naknikya":
            return run_chat2()
        else:
            print("Please enter (Naknik/Naknikya)")


# =====================================================================
# TWO NEW FUNCTIONS AT THE END
# =====================================================================

def your_first_new_function(text):
    # Add your custom logic here (e.g., text filtering, console logs, statistics)
    print("--- Running your first new function ---")
    return text

def your_second_new_function(text):
    # Add your custom logic here
    print("--- Running your second new function ---")
    return text


# Execution block
if __name__ == "__main__":
    final_reply = choose_chat()
    
    final_reply = your_first_new_function(final_reply)
    final_reply = your_second_new_function(final_reply)
    
    # ASK THE USER IF THEY WANT TO SAVE
    save_choice = input("Would you like to save the last response as a PDF? (yes/no): ")
    if save_choice.lower() in ['yes', 'y']:
        custom_name = input("Enter filename (or press Enter for default 'naknik_response.pdf'): ")
        
        if custom_name.strip():
            # Make sure it ends with .pdf
            if not custom_name.endswith('.pdf'):
                custom_name += '.pdf'
            save_response_as_pdf(final_reply, filename=custom_name)
        else:
            save_response_as_pdf(final_reply)
    else:
        print("Chat ended without saving.")