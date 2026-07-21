import os
from anthropic import Anthropic
from dotenv import load_dotenv
from reportlab.pdfgen import canvas

load_dotenv()

client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

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
    print(f"\n[System: PDF successfully saved as {filename}]\n")


def update_shared_profile(shared_context, global_history):
    """Background helper that reads the cumulative global history to extract facts."""
    if not global_history:
        return
    
    try:
        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=400,
            temperature=0,
            system="You are a data extraction assistant. Look at the conversation history and list out key facts about the user (e.g., trips, locations like France, position, age, injuries). Keep it as a concise, bulleted list. Do not include chat fluff.",
            messages=global_history
        )
        shared_context["user_profile"] = response.content[0].text
    except Exception:
        pass


def run_chat1(shared_context, global_history):
    print('\nYou: (type exit to quit to the main menu, or "save response" to save the last reply)')
    reply = "No conversation took place."

    while True:
        user_input = input('>> ')

        if user_input.lower() == 'exit':
            update_shared_profile(shared_context, global_history)
            break

        if user_input.lower() == 'save response':
            if reply != "No conversation took place.":
                # Prompt the user for a custom name
                custom_name = input("Enter filename (or press Enter for 'naknik_response.pdf'): ").strip()
                if not custom_name:
                    custom_name = "naknik_response.pdf"
                elif not custom_name.lower().endswith(".pdf"):
                    custom_name += ".pdf"
                
                save_response_as_pdf(reply, filename=custom_name)
            else:
                print("[System: No response has been generated yet to save!]")
            continue

        system_message = f"""
You are Naknik, an experienced football coach whose only purpose is to help users with football coaching.

                     ------------------------CRITICAL KNOWLEDGE------------------------
Here is what you and your partner agent (Naknikya) currently know about the user. Use this context to tailor your advice without asking repetitive questions:
{shared_context['user_profile']}

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

        global_history.append({'role': 'user', 'content': user_input})
        response = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=600,
            temperature=1,
            system=system_message,
            messages=global_history
        )

        reply = response.content[0].text
        print(f'Claude: {reply}')
        global_history.append({'role': 'assistant', 'content': reply})
        
        # Update profile immediately using the shared global history
        update_shared_profile(shared_context, global_history)
        
    return reply