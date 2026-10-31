import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.database import get_database
from app.schemas.interview import ProjectDetail, VALID_TECHNICAL_SKILLS
from app.services.audit_service import record_audit_log

CURATED_SKILL_QUESTIONS: Dict[str, List[Dict[str, Any]]] = {
    "C": [
        {
            "difficulty": "beginner",
            "question": "Can you explain the difference between pass-by-value and pass-by-reference in C using pointers?",
            "expected_key_points": ["Memory address", "Direct modification", "Pointer dereferencing *", "Address operator &"]
        },
        {
            "difficulty": "intermediate",
            "question": "How does dynamic memory allocation work with malloc, calloc, realloc, and free, and what causes a memory leak?",
            "expected_key_points": ["Heap vs stack", "Zero initialization in calloc", "Dangling pointers", "Freeing allocated blocks"]
        },
        {
            "difficulty": "advanced",
            "question": "Explain how structure padding and data alignment work in C compilers and how you would prevent memory wastage.",
            "expected_key_points": ["Memory boundary alignment", "#pragma pack", "Ordering members by size"]
        }
    ],
    "C++": [
        {
            "difficulty": "beginner",
            "question": "What are the core differences between a class and a struct in C++, and what is RAII?",
            "expected_key_points": ["Default access specifiers", "Resource Acquisition Is Initialization", "Destructor cleanup"]
        },
        {
            "difficulty": "intermediate",
            "question": "Explain virtual functions, vtable, and how runtime polymorphism is achieved in C++.",
            "expected_key_points": ["Virtual method table", "VPTR pointer", "Late binding / dynamic dispatch"]
        },
        {
            "difficulty": "advanced",
            "question": "How do smart pointers (std::unique_ptr, std::shared_ptr, std::weak_ptr) solve memory issues and circular references?",
            "expected_key_points": ["Exclusive ownership", "Reference counting control block", "Cycle breaking with weak_ptr"]
        }
    ],
    "Java": [
        {
            "difficulty": "beginner",
            "question": "How does Java achieve platform independence through bytecode and the Java Virtual Machine?",
            "expected_key_points": ["Bytecode .class", "JIT compilation", "JVM architecture across operating systems"]
        },
        {
            "difficulty": "intermediate",
            "question": "What is the difference between HashMap and ConcurrentHashMap, and how does Java handle hash collisions?",
            "expected_key_points": ["Segment locking / synchronized buckets", "Red-black tree conversion beyond threshold 8", "Thread safety"]
        },
        {
            "difficulty": "advanced",
            "question": "Explain the Java Garbage Collection generational hypothesis and difference between Young Gen and Old Gen collectors.",
            "expected_key_points": ["Eden, Survivor spaces", "Stop-the-world pauses", "G1 / ZGC collectors"]
        }
    ],
    "Python": [
        {
            "difficulty": "beginner",
            "question": "Explain how Python handles memory management and the role of the Global Interpreter Lock (GIL).",
            "expected_key_points": ["Reference counting", "Cyclic garbage collector", "GIL single-thread execution in CPython"]
        },
        {
            "difficulty": "intermediate",
            "question": "What are generators and decorators in Python, and how do they benefit application performance and maintainability?",
            "expected_key_points": ["Yield keyword", "Lazy evaluation / memory efficiency", "Higher-order functions", "functools.wraps"]
        },
        {
            "difficulty": "advanced",
            "question": "How does Python's asyncio event loop compare to threading and multiprocessing for I/O-bound vs CPU-bound tasks?",
            "expected_key_points": ["Single-threaded cooperative multitasking", "Coroutines with async/await", "ProcessPoolExecutor"]
        }
    ],
    "JavaScript": [
        {
            "difficulty": "beginner",
            "question": "Explain closures and lexical scoping in JavaScript with a real-world use case.",
            "expected_key_points": ["Outer function scope retention", "Data privacy / encapsulation", "Module pattern"]
        },
        {
            "difficulty": "intermediate",
            "question": "How does the JavaScript Event Loop handle Call Stack, Microtasks, and Macrotasks (e.g. Promises vs setTimeout)?",
            "expected_key_points": ["Event loop priority", "Microtask queue processed before next macrotask", "Single-threaded runtime"]
        },
        {
            "difficulty": "advanced",
            "question": "Explain prototype chaining and how modern ES6 classes map to prototypal inheritance under the hood.",
            "expected_key_points": ["__proto__ vs prototype", "Object.create", "Syntactic sugar of class keyword"]
        }
    ],
    "Data Structures and Algorithms": [
        {
            "difficulty": "beginner",
            "question": "When would you prefer an adjacency list over an adjacency matrix for representing a graph?",
            "expected_key_points": ["Space complexity O(V+E) vs O(V^2)", "Sparse vs dense graphs", "Edge lookup efficiency"]
        },
        {
            "difficulty": "intermediate",
            "question": "How does quicksort work, what is its worst-case time complexity, and how do you mitigate it?",
            "expected_key_points": ["Divide and conquer", "Pivot selection", "Median-of-three or randomized pivot", "O(N log N) average vs O(N^2)"]
        },
        {
            "difficulty": "advanced",
            "question": "Can you design a Least Recently Used (LRU) Cache with O(1) get and put operations?",
            "expected_key_points": ["Hash map combined with doubly linked list", "Fast node removal and head insertion"]
        }
    ],
    "SQL and Databases": [
        {
            "difficulty": "beginner",
            "question": "Explain the difference between clustered and non-clustered indexes in relational databases.",
            "expected_key_points": ["Physical ordering of table rows", "B-tree leaf nodes", "Single clustered index per table"]
        },
        {
            "difficulty": "intermediate",
            "question": "What are ACID properties and how do database transactions guarantee them under concurrent reads and writes?",
            "expected_key_points": ["Atomicity, Consistency, Isolation, Durability", "Transaction isolation levels", "Write-ahead logging (WAL)"]
        },
        {
            "difficulty": "advanced",
            "question": "When would you choose a document database like MongoDB over an SQL database, and how does horizontal sharding work?",
            "expected_key_points": ["Flexible schema", "JSON documents", "Partition keys / shard keys", "Replica sets"]
        }
    ],
    "HTML, CSS and Web Development": [
        {
            "difficulty": "beginner",
            "question": "Explain the CSS Box Model and the difference between content-box and border-box sizing.",
            "expected_key_points": ["Content, padding, border, margin", "Predictable width calculation with border-box"]
        },
        {
            "difficulty": "intermediate",
            "question": "How does browser rendering pipeline work (DOM, CSSOM, Render Tree, Layout, Paint, Composite)?",
            "expected_key_points": ["Critical rendering path", "Reflow vs Repaint", "GPU acceleration with transform/opacity"]
        },
        {
            "difficulty": "advanced",
            "question": "Explain Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF), and how modern web apps prevent them.",
            "expected_key_points": ["Content Security Policy (CSP)", "Input sanitization", "SameSite cookie attribute", "Anti-CSRF tokens"]
        }
    ],
    "Machine Learning and Artificial Intelligence": [
        {
            "difficulty": "beginner",
            "question": "Explain the bias-variance tradeoff and how overfitting can be detected and mitigated.",
            "expected_key_points": ["Underfitting vs overfitting", "Cross-validation", "L1/L2 regularization", "Dropout"]
        },
        {
            "difficulty": "intermediate",
            "question": "How does the Self-Attention mechanism in Transformer architectures compute token representations?",
            "expected_key_points": ["Query, Key, Value matrices", "Scaled dot-product", "Softmax weighting", "Multi-head attention"]
        },
        {
            "difficulty": "advanced",
            "question": "What techniques would you use to evaluate and optimize Large Language Model inference latency and accuracy in production?",
            "expected_key_points": ["Quantization (INT8/INT4)", "KV-caching", "Retrieval-Augmented Generation (RAG)", "Hallucination mitigation"]
        }
    ],
    "Operating Systems and Computer Networks": [
        {
            "difficulty": "beginner",
            "question": "Explain the difference between a process and a thread, and how inter-process communication (IPC) works.",
            "expected_key_points": ["Isolated address space vs shared memory", "Pipes, sockets, message queues", "Context switching overhead"]
        },
        {
            "difficulty": "intermediate",
            "question": "Walk through the TCP three-way handshake and describe how TCP handles reliable data transmission and flow control.",
            "expected_key_points": ["SYN, SYN-ACK, ACK", "Sequence numbers", "Sliding window", "Congestion control"]
        },
        {
            "difficulty": "advanced",
            "question": "Explain virtual memory, paging, translation lookaside buffer (TLB), and what happens during a page fault.",
            "expected_key_points": ["Virtual to physical address translation", "Page table", "TLB hit/miss", "Disk swap fetching"]
        }
    ]
}

BEHAVIORAL_QUESTIONS = [
    {
        "topic": "Problem-Solving & Critical Thinking",
        "question": "Tell me about a situation in your projects where you encountered a critical bug or technical roadblock. How did you diagnose and resolve it?"
    },
    {
        "topic": "Teamwork & Communication",
        "question": "How do you handle disagreements within a technical project team regarding architecture or implementation choices?"
    },
    {
        "topic": "Adaptability & Time Management",
        "question": "When facing tight academic deadlines or shifting project requirements, how do you prioritize tasks to deliver on time?"
    }
]

def generate_project_questions(project: ProjectDetail) -> List[Dict[str, Any]]:
    return [
        {
            "id": str(uuid.uuid4()),
            "category": "project",
            "skill_topic": project.title,
            "difficulty": "intermediate",
            "question_text": f"In your project '{project.title}', what specific architectural design decisions did you make, and why did you choose {project.technologies}?",
            "expected_key_points": ["Architecture choice", "Tech stack justification", "System components"]
        },
        {
            "id": str(uuid.uuid4()),
            "category": "project",
            "skill_topic": project.title,
            "difficulty": "advanced",
            "question_text": f"What was your individual contribution to '{project.title}', and how did you overcome the primary challenge of: {project.challenges[:120]}...?",
            "expected_key_points": ["Individual ownership", "Problem diagnosis", "Measurable outcome"]
        }
    ]

async def create_interview_session(
    student_id: str,
    student_name: str,
    registration_number: str,
    selected_skills: List[str],
    projects: List[ProjectDetail],
    duration_minutes: int = 20
) -> Dict[str, Any]:
    db = await get_database()
    now = datetime.now(timezone.utc)
    interview_id = str(uuid.uuid4())

    # Build structured questions
    generated_questions: List[Dict[str, Any]] = []

    # 1. Technical questions for each selected skill (2-3 per skill)
    for skill in selected_skills:
        questions_pool = CURATED_SKILL_QUESTIONS.get(skill, [])
        for q in questions_pool:
            generated_questions.append({
                "id": str(uuid.uuid4()),
                "category": "technical",
                "skill_topic": skill,
                "difficulty": q["difficulty"],
                "question_text": q["question"],
                "expected_key_points": q["expected_key_points"]
            })

    # 2. Project questions (2 per project)
    for p in projects:
        generated_questions.extend(generate_project_questions(p))

    # 3. Behavioral questions
    for b in BEHAVIORAL_QUESTIONS:
        generated_questions.append({
            "id": str(uuid.uuid4()),
            "category": "behavioral",
            "skill_topic": b["topic"],
            "difficulty": "intermediate",
            "question_text": b["question"],
            "expected_key_points": ["Clarity", "STAR method", "Self-awareness"]
        })

    interview_doc = {
        "_id": interview_id,
        "interview_id": interview_id,
        "student_id": student_id,
        "student_name": student_name,
        "registration_number": registration_number,
        "selected_skills": selected_skills,
        "projects": [p.model_dump() for p in projects],
        "duration_minutes": duration_minutes,
        "status": "ready",  # ready -> in_progress -> completed -> evaluated
        "questions": generated_questions,
        "current_question_index": 0,
        "transcript": [],
        "proctoring_incidents": [],
        "warnings_count": 0,
        "created_at": now,
        "started_at": None,
        "ended_at": None
    }

    await db["interviews"].insert_one(interview_doc)

    await record_audit_log(
        actor_id=student_id,
        actor_name=student_name,
        actor_role="student",
        action="INTERVIEW_SESSION_CREATED",
        target_id=interview_id,
        target_type="interview",
        details={"skills": selected_skills, "projects_count": len(projects)}
    )

    return {
        "interview_id": interview_id,
        "student_id": student_id,
        "skills": selected_skills,
        "questions_count": len(generated_questions),
        "duration_minutes": duration_minutes,
        "status": "ready"
    }
