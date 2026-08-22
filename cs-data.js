const CS_DATA = {
  "meta": {
    "title": "CS Fundamentals & System Design Tracker",
    "description": "Organized by subject > topic. Each topic has a 'notes' field with radio-style options describing your current understanding level (pick one, add more via custom_note), plus a curated list of frequently-asked interview questions tagged by company (based on commonly reported patterns) and frequency, with a field to store your own answer.",
    "how_to_use": "For each topic: set notes.selected to one of notes.options (or write your own in notes.options and select it, or use custom_note for free text). For each interview_question, fill your_answer as you prep."
  },
  "subjects": [
    {
      "subject": "DBMS",
      "topics": [
        {
          "topic": "ACID Properties & Transactions",
          "notes": {
            "options": [
              "Understand all 4 properties with examples",
              "Understand conceptually, need real examples",
              "Confident, can explain isolation levels too",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain ACID properties with a real-world example.",
              "companies": [
                "Amazon",
                "Microsoft",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What are isolation levels? Explain dirty read, non-repeatable read, phantom read.",
              "companies": [
                "Google",
                "Amazon"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What is a deadlock in DBMS and how is it prevented/detected?",
              "companies": [
                "Microsoft",
                "General"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Normalization",
          "notes": {
            "options": [
              "Know 1NF-3NF with examples",
              "Know up to BCNF",
              "Can explain trade-offs of denormalization",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain 1NF, 2NF, 3NF, and BCNF with examples.",
              "companies": [
                "General",
                "Amazon"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Why would you denormalize a database? Give a real use case.",
              "companies": [
                "Meta",
                "Amazon"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Indexing",
          "notes": {
            "options": [
              "Know B-Tree index basics",
              "Understand clustered vs non-clustered",
              "Know trade-offs (write overhead, storage)",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What is the difference between clustered and non-clustered indexes?",
              "companies": [
                "Microsoft",
                "Amazon",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "How does a B+ Tree index improve query performance?",
              "companies": [
                "Google",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "When would an index hurt performance instead of helping?",
              "companies": [
                "Amazon"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Joins & Query Optimization",
          "notes": {
            "options": [
              "Know inner/outer/left/right joins",
              "Understand query execution plans",
              "Can optimize slow queries",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN.",
              "companies": [
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "How would you optimize a slow SQL query?",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What is the N+1 query problem and how do you avoid it?",
              "companies": [
                "Meta",
                "Amazon"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "SQL vs NoSQL",
          "notes": {
            "options": [
              "Know basic differences",
              "Understand CAP theorem tie-in",
              "Can pick the right DB for a given use case",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "When would you choose NoSQL over SQL?",
              "companies": [
                "Amazon",
                "Google",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Explain the CAP theorem and how it relates to database choice.",
              "companies": [
                "Amazon",
                "Google"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Transactions & Concurrency Control",
          "notes": {
            "options": [
              "Understand locking basics",
              "Understand MVCC",
              "Can explain optimistic vs pessimistic concurrency",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What is MVCC (Multi-Version Concurrency Control) and how does Postgres use it?",
              "companies": [
                "Amazon",
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "Explain optimistic vs pessimistic locking.",
              "companies": [
                "Microsoft",
                "General"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        }
      ]
    },
    {
      "subject": "Operating Systems",
      "topics": [
        {
          "topic": "Processes vs Threads",
          "notes": {
            "options": [
              "Know basic definitions",
              "Understand context switching cost",
              "Can explain multi-threading trade-offs deeply",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What is the difference between a process and a thread?",
              "companies": [
                "Amazon",
                "Microsoft",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What happens during a context switch?",
              "companies": [
                "Google",
                "Microsoft"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Process Scheduling",
          "notes": {
            "options": [
              "Know FCFS, SJF, Round Robin basics",
              "Understand priority scheduling & starvation",
              "Can compare scheduling algorithms with trade-offs",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain Round Robin scheduling and how time quantum affects performance.",
              "companies": [
                "Microsoft",
                "General"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "What is starvation and how is it prevented (aging)?",
              "companies": [
                "Amazon"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Memory Management & Virtual Memory",
          "notes": {
            "options": [
              "Know paging vs segmentation basics",
              "Understand page faults & thrashing",
              "Can explain TLB and demand paging in depth",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What is virtual memory and why is it used?",
              "companies": [
                "Amazon",
                "Microsoft",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Explain paging vs segmentation.",
              "companies": [
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "What is thrashing and how do you prevent it?",
              "companies": [
                "Microsoft"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Deadlocks",
          "notes": {
            "options": [
              "Know 4 necessary conditions",
              "Understand prevention/avoidance (Banker's algorithm)",
              "Can design deadlock-free systems",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What are the 4 necessary conditions for a deadlock?",
              "companies": [
                "Amazon",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Explain the Banker's algorithm for deadlock avoidance.",
              "companies": [
                "Microsoft"
              ],
              "frequency": "low",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Concurrency: Locks, Semaphores, Mutex",
          "notes": {
            "options": [
              "Know mutex vs semaphore difference",
              "Understand producer-consumer problem",
              "Can design lock-free/concurrent solutions",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What is the difference between a mutex and a semaphore?",
              "companies": [
                "Amazon",
                "Microsoft",
                "Google"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Solve the classic producer-consumer problem using semaphores.",
              "companies": [
                "Google",
                "Amazon"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "CPU Scheduling & I/O",
          "notes": {
            "options": [
              "Know basic I/O bound vs CPU bound processes",
              "Understand interrupt handling",
              "Can explain modern scheduler design (CFS)",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What is the Completely Fair Scheduler (CFS) used in Linux?",
              "companies": [
                "Google"
              ],
              "frequency": "low",
              "your_answer": ""
            }
          ]
        }
      ]
    },
    {
      "subject": "Computer Networks",
      "topics": [
        {
          "topic": "OSI & TCP/IP Model",
          "notes": {
            "options": [
              "Know the 7 layers by name",
              "Understand what happens at each layer",
              "Can map real protocols to each layer confidently",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain the OSI model layers with an example protocol at each layer.",
              "companies": [
                "Amazon",
                "Microsoft",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What's the difference between TCP and UDP? When would you use each?",
              "companies": [
                "Amazon",
                "Google",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "TCP Handshake & Connection Management",
          "notes": {
            "options": [
              "Know 3-way handshake steps",
              "Understand 4-way termination (FIN/ACK)",
              "Can explain TCP congestion control (slow start etc.)",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain the TCP 3-way handshake.",
              "companies": [
                "Amazon",
                "Microsoft",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What is TCP congestion control? Explain slow start.",
              "companies": [
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "DNS",
          "notes": {
            "options": [
              "Know what DNS resolution does",
              "Understand recursive vs iterative queries",
              "Can explain DNS caching, TTL, and CDN interplay",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Walk through what happens when you type a URL into a browser (DNS resolution part).",
              "companies": [
                "Amazon",
                "Google",
                "Meta",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "HTTP/HTTPS & REST",
          "notes": {
            "options": [
              "Know HTTP methods and status codes",
              "Understand HTTPS/TLS handshake basics",
              "Can design RESTful APIs following best practices",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What happens during a TLS/SSL handshake?",
              "companies": [
                "Amazon",
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "Explain REST principles and statelessness.",
              "companies": [
                "Amazon",
                "Microsoft",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Load Balancing & CDN",
          "notes": {
            "options": [
              "Know what a load balancer does",
              "Understand L4 vs L7 load balancing",
              "Can design multi-region CDN + LB architecture",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What's the difference between Layer 4 and Layer 7 load balancing?",
              "companies": [
                "Amazon",
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "How does a CDN reduce latency?",
              "companies": [
                "Amazon",
                "Meta"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Sockets & Network Programming",
          "notes": {
            "options": [
              "Know basic client-server socket model",
              "Understand blocking vs non-blocking I/O",
              "Can explain epoll/select and event-driven servers",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What is the difference between blocking and non-blocking I/O?",
              "companies": [
                "Google",
                "Amazon"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        }
      ]
    },
    {
      "subject": "OOP",
      "topics": [
        {
          "topic": "Four Pillars of OOP",
          "notes": {
            "options": [
              "Know encapsulation, abstraction, inheritance, polymorphism definitions",
              "Can give code examples for each",
              "Can explain trade-offs and misuse",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain the four pillars of OOP with real examples.",
              "companies": [
                "Amazon",
                "Microsoft",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What is the difference between abstraction and encapsulation?",
              "companies": [
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "SOLID Principles",
          "notes": {
            "options": [
              "Know what each letter stands for",
              "Can give a code example for each principle",
              "Can refactor bad code using SOLID",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain the Single Responsibility Principle with an example.",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What is the Open/Closed Principle?",
              "companies": [
                "Microsoft",
                "General"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "Explain Dependency Inversion with an example.",
              "companies": [
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Design Patterns",
          "notes": {
            "options": [
              "Know Singleton, Factory, Observer basics",
              "Understand Strategy, Decorator, Builder",
              "Can pick the right pattern for a real design problem",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain the Singleton pattern and its pitfalls in multi-threaded environments.",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "When would you use the Observer pattern? Give a real example.",
              "companies": [
                "Google",
                "Meta"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "Explain the Factory vs Abstract Factory pattern.",
              "companies": [
                "Microsoft"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Polymorphism: Compile-time vs Runtime",
          "notes": {
            "options": [
              "Know method overloading vs overriding",
              "Understand vtables / dynamic dispatch conceptually",
              "Can explain performance implications",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What is the difference between method overloading and overriding?",
              "companies": [
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "How does runtime polymorphism work under the hood (vtable)?",
              "companies": [
                "Microsoft",
                "Google"
              ],
              "frequency": "low",
              "your_answer": ""
            }
          ]
        }
      ]
    },
    {
      "subject": "DSA",
      "topics": [
        {
          "topic": "Arrays & Strings",
          "notes": {
            "options": [
              "Comfortable with two-pointer, sliding window",
              "Comfortable with prefix sums, in-place ops",
              "Can solve hard string/array problems fluently",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Solve: find the longest substring without repeating characters (sliding window).",
              "companies": [
                "Amazon",
                "Google",
                "Meta",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Solve: two-sum / three-sum problems.",
              "companies": [
                "Amazon",
                "Meta",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Linked Lists",
          "notes": {
            "options": [
              "Comfortable with reversal, cycle detection",
              "Comfortable with merge, intersection problems",
              "Can solve LRU cache / complex pointer manipulation",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Detect a cycle in a linked list (Floyd's algorithm).",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Reverse a linked list iteratively and recursively.",
              "companies": [
                "Amazon",
                "Google",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Design an LRU Cache using a linked list + hashmap.",
              "companies": [
                "Amazon",
                "Google",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Trees & Graphs",
          "notes": {
            "options": [
              "Comfortable with DFS/BFS traversal",
              "Comfortable with BSTs, tree balancing basics",
              "Can solve advanced graph problems (Dijkstra, topological sort, Union-Find)",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Implement BFS and DFS on a graph.",
              "companies": [
                "Amazon",
                "Google",
                "Meta",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Find the shortest path in a weighted graph (Dijkstra's algorithm).",
              "companies": [
                "Google",
                "Amazon"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Detect a cycle in a directed graph / topological sort.",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "Lowest Common Ancestor in a Binary Tree.",
              "companies": [
                "Amazon",
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Dynamic Programming",
          "notes": {
            "options": [
              "Comfortable with 1D DP (fibonacci, climbing stairs)",
              "Comfortable with 2D DP (knapsack, LCS, edit distance)",
              "Can identify and solve novel DP problems under time pressure",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Solve the 0/1 Knapsack problem.",
              "companies": [
                "Amazon",
                "Google",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Solve Longest Common Subsequence.",
              "companies": [
                "Amazon",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Solve Edit Distance problem.",
              "companies": [
                "Google",
                "Microsoft"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Heaps, Stacks & Queues",
          "notes": {
            "options": [
              "Know basic operations and use cases",
              "Comfortable with priority queue based problems",
              "Can design systems using these (e.g. task scheduler)",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Find the k-th largest element in an array using a heap.",
              "companies": [
                "Amazon",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Implement a stack using queues (and vice versa).",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Sorting & Searching",
          "notes": {
            "options": [
              "Know basic sorts (merge, quick) and binary search",
              "Comfortable with modified binary search problems",
              "Can analyze time/space trade-offs of algorithm choices",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Implement quicksort and explain its worst-case complexity.",
              "companies": [
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Search in a rotated sorted array.",
              "companies": [
                "Amazon",
                "Google",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        }
      ]
    },
    {
      "subject": "System Design",
      "topics": [
        {
          "topic": "Scalability Basics: Vertical vs Horizontal Scaling",
          "notes": {
            "options": [
              "Know the difference conceptually",
              "Understand stateless service design for horizontal scaling",
              "Can design auto-scaling strategies",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What's the difference between vertical and horizontal scaling? When would you use each?",
              "companies": [
                "Amazon",
                "Google",
                "Meta",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Load Balancing",
          "notes": {
            "options": [
              "Know round robin, least connections basics",
              "Understand consistent hashing",
              "Can design multi-tier load balancing for a global service",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain consistent hashing and why it's used in distributed systems.",
              "companies": [
                "Amazon",
                "Google",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "How would you design a load balancer for a high-traffic service?",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Caching",
          "notes": {
            "options": [
              "Know cache-aside, write-through basics",
              "Understand cache eviction policies (LRU, LFU)",
              "Can design multi-layer caching (CDN + app cache + DB cache)",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Design a distributed cache like Redis. What eviction policy would you use?",
              "companies": [
                "Amazon",
                "Google",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Explain cache invalidation strategies and the 'two hard things in CS' joke.",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Database Sharding & Replication",
          "notes": {
            "options": [
              "Know basic sharding concept",
              "Understand replication (master-slave, multi-master)",
              "Can design a sharding strategy for a specific access pattern",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "How would you shard a database for a social media app with billions of users?",
              "companies": [
                "Meta",
                "Amazon",
                "Google"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Explain master-slave replication and its trade-offs (read replicas, replication lag).",
              "companies": [
                "Amazon",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "CAP Theorem & Consistency Models",
          "notes": {
            "options": [
              "Know CAP theorem definition",
              "Understand eventual vs strong consistency",
              "Can pick consistency models per use-case in a design interview",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Explain CAP theorem with a real system example (e.g. DynamoDB vs traditional RDBMS).",
              "companies": [
                "Amazon",
                "Google"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "What is eventual consistency and where is it acceptable?",
              "companies": [
                "Amazon",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Message Queues & Event-Driven Architecture",
          "notes": {
            "options": [
              "Know why queues decouple services",
              "Understand pub/sub vs point-to-point",
              "Can design an event-driven pipeline with exactly-once semantics",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Design a notification system using message queues (e.g. Kafka/SQS).",
              "companies": [
                "Amazon",
                "Meta",
                "Google"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "How do you guarantee exactly-once delivery in a distributed message queue?",
              "companies": [
                "Amazon",
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Rate Limiting",
          "notes": {
            "options": [
              "Know token bucket vs leaky bucket basics",
              "Understand distributed rate limiting challenges",
              "Can design a rate limiter for an API gateway at scale",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Design a rate limiter. Compare token bucket vs sliding window algorithms.",
              "companies": [
                "Amazon",
                "Google",
                "Microsoft"
              ],
              "frequency": "high",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Classic System Design Questions",
          "notes": {
            "options": [
              "Aware of the common questions list",
              "Have practiced 2-3 of them end-to-end",
              "Comfortable designing any of these under 45 min with trade-off discussion",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "Design a URL shortener (e.g. bit.ly).",
              "companies": [
                "Amazon",
                "Microsoft",
                "General"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Design Twitter's news feed / timeline.",
              "companies": [
                "Meta",
                "Amazon",
                "Google"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Design a ride-sharing service like Uber (matching, location tracking).",
              "companies": [
                "Uber",
                "Amazon",
                "Google"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Design WhatsApp/a chat application (message delivery, online status).",
              "companies": [
                "Meta",
                "Amazon"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Design a distributed file storage system like Google Drive/Dropbox.",
              "companies": [
                "Google",
                "Dropbox",
                "Amazon"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Design a video streaming service like YouTube/Netflix (upload, transcoding, CDN delivery).",
              "companies": [
                "Netflix",
                "Google",
                "Amazon"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "Design an e-commerce checkout/inventory system.",
              "companies": [
                "Amazon",
                "Flipkart"
              ],
              "frequency": "medium",
              "your_answer": ""
            },
            {
              "question": "Design a parking lot system (OOP + system design hybrid).",
              "companies": [
                "Microsoft",
                "General"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        },
        {
          "topic": "Microservices vs Monolith",
          "notes": {
            "options": [
              "Know basic trade-offs",
              "Understand service discovery, API gateway concepts",
              "Can design a migration path from monolith to microservices",
              "Need to revise",
              "Not started"
            ],
            "selected": "",
            "custom_note": ""
          },
          "interview_questions": [
            {
              "question": "What are the trade-offs between microservices and a monolithic architecture?",
              "companies": [
                "Amazon",
                "Microsoft",
                "Meta"
              ],
              "frequency": "high",
              "your_answer": ""
            },
            {
              "question": "How does service discovery work in a microservices architecture?",
              "companies": [
                "Amazon",
                "Google"
              ],
              "frequency": "medium",
              "your_answer": ""
            }
          ]
        }
      ]
    }
  ],
  "system_design": {
    "meta": {
      "title": "System Design Concepts & Architecture Patterns",
      "description": "Curated system design concepts, trade-offs, and high-frequency real-world design problems."
    },
    "topics": [
      {
        "id": "sd-1",
        "topic": "Scalability: Vertical vs Horizontal Scaling",
        "category": "Foundations",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q1",
            "question": "What is the difference between vertical and horizontal scaling? When would you use each?",
            "companies": [
              "Amazon",
              "Google",
              "Meta",
              "Microsoft"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-2",
        "topic": "Load Balancing & Consistent Hashing",
        "category": "Routing & Traffic",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q2",
            "question": "Explain consistent hashing and why it is used in distributed systems.",
            "companies": [
              "Amazon",
              "Google",
              "Meta"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q3",
            "question": "How would you design a load balancer for a high-traffic service?",
            "companies": [
              "Amazon",
              "Microsoft"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-3",
        "topic": "Caching Strategies & Eviction Policies",
        "category": "Performance & Storage",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q4",
            "question": "Design a distributed cache like Redis. What eviction policy would you use?",
            "companies": [
              "Amazon",
              "Google",
              "Meta"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q5",
            "question": "Explain cache-aside, write-through, write-behind, and cache invalidation strategies.",
            "companies": [
              "Amazon",
              "Microsoft"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-4",
        "topic": "Database Sharding & Replication",
        "category": "Databases & Storage",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q6",
            "question": "How would you shard a database for a social media app with billions of users?",
            "companies": [
              "Meta",
              "Amazon",
              "Google"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q7",
            "question": "Explain master-slave replication and its trade-offs (read replicas, replication lag).",
            "companies": [
              "Amazon",
              "Microsoft"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-5",
        "topic": "CAP Theorem & Consistency Models",
        "category": "Distributed Systems",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q8",
            "question": "Explain CAP theorem with a real system example (e.g. DynamoDB vs traditional RDBMS).",
            "companies": [
              "Amazon",
              "Google"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q9",
            "question": "What is eventual consistency and where is it acceptable?",
            "companies": [
              "Amazon",
              "Meta"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-6",
        "topic": "Message Queues & Event-Driven Architecture",
        "category": "Messaging & Async",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q10",
            "question": "Design a notification system using message queues (e.g. Kafka/SQS).",
            "companies": [
              "Amazon",
              "Meta",
              "Google"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q11",
            "question": "How do you guarantee exactly-once delivery in a distributed message queue?",
            "companies": [
              "Amazon",
              "Google"
            ],
            "frequency": "medium",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-7",
        "topic": "Rate Limiting",
        "category": "Resilience & Security",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q12",
            "question": "Design a rate limiter. Compare token bucket vs sliding window counter algorithms.",
            "companies": [
              "Amazon",
              "Google",
              "Microsoft"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-8",
        "topic": "Storage, CDNs & Edge Caching",
        "category": "Performance & Storage",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q13",
            "question": "How does a CDN handle cache invalidation globally with low latency?",
            "companies": [
              "Cloudflare",
              "Netflix",
              "Amazon"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-9",
        "topic": "APIs & Communication Protocols",
        "category": "Networking & APIs",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q15",
            "question": "Compare REST, GraphQL, gRPC, and WebSockets for modern distributed microservices.",
            "companies": [
              "Uber",
              "Google",
              "Meta"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-10",
        "topic": "Reliability, High Availability & Observability",
        "category": "Operations & Reliability",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q16",
            "question": "How do you achieve 99.999% availability (Five Nines) in a distributed system?",
            "companies": [
              "Google",
              "Amazon",
              "Microsoft"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-11",
        "topic": "Microservices vs Monolith",
        "category": "Architecture",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q18",
            "question": "What are the trade-offs between microservices and a monolithic architecture?",
            "companies": [
              "Amazon",
              "Microsoft",
              "Meta"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      },
      {
        "id": "sd-12",
        "topic": "Classic Real-World Design Problems",
        "category": "Case Studies",
        "notes": {
          "options": [
            "Not started",
            "Need revision",
            "Conceptual understanding",
            "Can explain with example",
            "Confident",
            "Interview ready"
          ],
          "selected": "",
          "explanation": "",
          "examples": "",
          "confusion": "",
          "mistakes": "",
          "interview_notes": ""
        },
        "interview_questions": [
          {
            "id": "sd-q20",
            "question": "Design a URL shortener (e.g. bit.ly).",
            "companies": [
              "Amazon",
              "Microsoft",
              "General"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q21",
            "question": "Design Twitter news feed / timeline with fanout-on-write and fanout-on-read.",
            "companies": [
              "Meta",
              "Amazon",
              "Google"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q22",
            "question": "Design a ride-sharing service like Uber (geospatial indexing, location tracking).",
            "companies": [
              "Uber",
              "Amazon",
              "Google"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q23",
            "question": "Design WhatsApp / a chat application (WebSockets, delivery receipts, offline messages).",
            "companies": [
              "Meta",
              "Amazon"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q24",
            "question": "Design a distributed file storage system like Google Drive/Dropbox (chunking, deduplication).",
            "companies": [
              "Google",
              "Dropbox",
              "Amazon"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          },
          {
            "id": "sd-q25",
            "question": "Design a video streaming service like YouTube/Netflix (transcoding, adaptive bitrate streaming).",
            "companies": [
              "Netflix",
              "Google",
              "Amazon"
            ],
            "frequency": "high",
            "status": "unanswered",
            "your_answer": ""
          }
        ]
      }
    ]
  }
};
