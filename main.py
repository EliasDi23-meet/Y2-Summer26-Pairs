import os
from anthropic import Anthropic
from dotenv import load_dotenv
from reportlab.pdfgen import canvas
from app1 import run_chat1
from app2 import run_chat2

load_dotenv()

#client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY1'))

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


def choose_chat(shared_context, global_history):
    while True:
        choice = input("\nWhich agent do you want to use? (Naknik/Naknikya): ")
        
        if choice.lower() == "naknik":
            return run_chat1(shared_context, global_history)
        elif choice.lower() == "naknikya":
            return run_chat2(shared_context, global_history)
        else:
            print("Please enter (Naknik/Naknikya)")




 
# Execution block
if __name__ == "__main__":
    shared_memory = {
        "user_profile": "No profile details established yet."
    }
    global_conversation_history = []
    
    print("--- Welcome to the Football Training Station! ---")
    
    while True:
        final_reply = choose_chat(shared_memory, global_conversation_history)
        
        
        print("\n[System: You exited the chat room.]")
        next_step = input("Type 'switch' to choose another agent, or 'quit' to close the app: ")
        
        if next_step.lower() == 'quit':
            print("Session ended cleanly. Goodbye!")
            break 