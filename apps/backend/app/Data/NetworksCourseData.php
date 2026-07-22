<?php

namespace App\Data;

class NetworksCourseData
{
    public static function getCourse(): array
    {
        return [
            'slug' => 'introduction-to-computer-networks',
            'title' => 'Introduction to Computer Networks',
            'description' => 'Comprehensive Module 1 covering computer network fundamentals including what networks are, data communication, network characteristics, architectures, topologies, and foundational concepts essential for cybersecurity.',
            'price' => 499,
            'status' => 'published',
        ];
    }

    public static function getLessons(): array
    {
        return [
            ['position' => 1, 'title' => 'M1 - Lesson 1: What is a Computer Network?', 'content' => self::lesson1(), 'has_quiz' => false],
            ['position' => 2, 'title' => 'M1 - Lesson 2: Basic Characteristics of a Network', 'content' => self::lesson2(), 'has_quiz' => false],
            ['position' => 3, 'title' => 'M1 - Lesson 3: Data Communication Fundamentals', 'content' => self::lesson3(), 'has_quiz' => false],
            ['position' => 4, 'title' => 'M1 - Lesson 4: Data Flow Modes', 'content' => self::lesson4(), 'has_quiz' => false],
            ['position' => 5, 'title' => 'M1 - Lesson 5: Types of Communication', 'content' => self::lesson5(), 'has_quiz' => false],
            ['position' => 6, 'title' => 'M1 - Lesson 6: Network Architectures', 'content' => self::lesson6(), 'has_quiz' => false],
            ['position' => 7, 'title' => 'M1 - Lesson 7: Network Types by Scale', 'content' => self::lesson7(), 'has_quiz' => false],
            ['position' => 8, 'title' => 'M1 - Lesson 8: Internet, Intranet, and Extranet', 'content' => self::lesson8(), 'has_quiz' => false],
            ['position' => 9, 'title' => 'M1 - Lesson 9: Network Topologies', 'content' => self::lesson9(), 'has_quiz' => false],
            [
                'position' => 10,
                'title' => 'M1 - Module Quiz: Introduction to Computer Networks',
                'content' => self::lesson10(),
                'has_quiz' => true,
                'quiz_question' => 'Which of the following best defines a Computer Network?',
                'quiz_option_a' => 'A single computer connected to the internet',
                'quiz_option_b' => 'Two or more nodes connected by communication links to share data and resources',
                'quiz_option_c' => 'A software application for communication',
                'quiz_option_d' => 'A type of operating system',
                'quiz_correct_option' => 'B',
            ],
        ];
    }

    public static function getQuiz(): array
    {
        return [
            'title' => 'Module 1 Quiz: Introduction to Computer Networks',
            'questions_json' => [
                ['question' => 'Which of the following best defines a Computer Network?', 'options' => ['A single computer connected to the internet', 'Two or more nodes connected by communication links to share data and resources', 'A software application for communication', 'A type of operating system'], 'correct' => 1],
                ['question' => 'What does the "I" in the CIA Triad stand for?', 'options' => ['Internet', 'Interface', 'Integrity', 'Information'], 'correct' => 2],
                ['question' => 'In which data flow mode can BOTH devices send and receive data at the SAME time?', 'options' => ['Simplex', 'Half Duplex', 'Full-Duplex', 'Uni-Duplex'], 'correct' => 2],
                ['question' => 'A network that spans an entire city and is often operated by a telecom provider is called a:', 'options' => ['LAN', 'PAN', 'MAN', 'CAN'], 'correct' => 2],
                ['question' => 'Which network topology has ALL devices connected to a single central switch or hub?', 'options' => ['Bus', 'Ring', 'Star', 'Mesh'], 'correct' => 2],
                ['question' => 'Which type of communication sends data to a SPECIFIC GROUP of subscribed devices?', 'options' => ['Unicast', 'Multicast', 'Broadcast', 'Anycast'], 'correct' => 1],
                ['question' => 'What is the difference between Bandwidth and Throughput?', 'options' => ['Bandwidth is actual speed, Throughput is theoretical maximum', 'Bandwidth is theoretical maximum, Throughput is actual speed achieved', 'They are the same thing', 'Bandwidth is measured in ms, Throughput in Mbps'], 'correct' => 1],
                ['question' => 'An Extranet is best described as:', 'options' => ['The global public network', 'A private internal network used within an organization', 'An extension of Intranet partially accessible to authorized outsiders', 'A personal area network'], 'correct' => 2],
                ['question' => 'In a Peer-to-Peer (P2P) network, which of the following is TRUE?', 'options' => ['There is a centralized server managing all resources', 'Each device acts as both a client and a server', 'It is more secure than Client-Server', 'It is highly scalable for large enterprises'], 'correct' => 1],
                ['question' => 'Which network topology provides the HIGHEST fault tolerance because every device has a direct connection to every other device?', 'options' => ['Bus', 'Ring', 'Star', 'Full Mesh'], 'correct' => 3],
                ['question' => 'Which of the following is NOT a node in a computer network?', 'options' => ['Router', 'Printer', 'Monitor (non-touch, traditional)', 'Switch'], 'correct' => 2],
                ['question' => 'What is the primary purpose of Quality of Service (QoS) in a network?', 'options' => ['To increase bandwidth for all traffic equally', 'To prioritize certain types of traffic to ensure smooth performance for critical applications', 'To encrypt all data traveling across the network', 'To create redundant paths for fault tolerance'], 'correct' => 1],
                ['question' => 'Which of the following correctly orders the data size units from smallest to largest?', 'options' => ['Byte > Bit > Megabyte > Gigabyte > Kilobyte > Terabyte', 'Bit > Byte > Kilobyte > Megabyte > Gigabyte > Terabyte', 'Bit > Kilobyte > Byte > Megabyte > Terabyte > Gigabyte', 'Byte > Kilobyte > Bit > Gigabyte > Megabyte > Terabyte'], 'correct' => 1],
                ['question' => 'A signal that is continuous and varies smoothly over time is called:', 'options' => ['Digital signal', 'Binary signal', 'Analog signal', 'Discrete signal'], 'correct' => 2],
                ['question' => 'Which transmission method uses pulses of light through glass or plastic fibers and is immune to electromagnetic interference?', 'options' => ['Copper cable (Electrical)', 'Fiber optic', 'Wireless (Radio waves)', 'Coaxial cable'], 'correct' => 1],
                ['question' => 'The time it takes for a data packet to travel from source to destination is called:', 'options' => ['Bandwidth', 'Throughput', 'Latency', 'Jitter'], 'correct' => 2],
                ['question' => 'In the Client-Server model, which statement is TRUE?', 'options' => ['Clients provide services to servers', 'All devices act as both clients and servers simultaneously', 'Servers provide services and clients request those services', 'There is no centralized management'], 'correct' => 2],
                ['question' => 'Which network type is the smallest in terms of geographical area?', 'options' => ['LAN', 'PAN', 'CAN', 'MAN'], 'correct' => 1],
                ['question' => 'The CIA Triad consists of which three principles?', 'options' => ['Confidentiality, Integrity, Availability', 'Control, Inspection, Authentication', 'Cipher, Integrity, Authorization', 'Confidentiality, Identification, Access'], 'correct' => 0],
                ['question' => 'A network that is privately owned and operated within a single building or campus is typically a:', 'options' => ['WAN', 'MAN', 'LAN', 'PAN'], 'correct' => 2],
            ],
            'pass_score' => 50,
            'max_retries' => 3,
        ];
    }

    private static function lesson1(): string
    {
return <<<'MD'
# Introduction to Computer Networks

Welcome to Module 1: Introduction to Computer Networks. This is the first and most important module in your networking journey. Before you can understand cybersecurity, ethical hacking, or any advanced networking topic, you need a very solid foundation and that starts here.

In this module, you will learn what a computer network actually is, why it was invented, how data travels from one machine to another, and all the different types and shapes of networks you encounter every single day even without realizing it.

Think of a computer network like a road system in a city. Roads connect buildings (computers). Vehicles carry passengers and goods (data). Traffic rules keep things orderly (protocols). Just as roads allow a city to function, networks allow computers to communicate and share resources.

#### Why is this important for Cybersecurity?

- Every attack travels over a network. Hackers exploit networks to gain unauthorized access to systems.
- You cannot defend what you do not understand. A cybersecurity professional must deeply understand how data moves across networks.
- Tools like Wireshark, Nmap, and Metasploit all operate at the network level. You will use them later in this course.
- Certifications like CompTIA Security+, CEH, and OSCP all test networking fundamentals heavily.

---

## What is a Computer Network?

A **Computer Network** is a collection of two or more computing devices called **nodes** that are connected together through **communication links** so they can share data, resources, and services with each other.

**Formula:**

```
Network = Nodes + Communication Links + Rules (Protocols)
```

A computer network is a set of nodes connected by communication links. The link carries information from one node to another.

## What are Nodes?

A node is any device that can send, receive, or process data on a network. If a device can send data or receive data or both, we can call that device a node.

### Examples of Nodes:

| **Type** | **Description** |
| --- | --- |
| Computers and Laptops | The most common nodes that users interact with directly |
| Servers | Machines that provide services like websites, email, and file storage |
| Routers and Switches | Devices that direct and manage the flow of data across a network |
| Smartphones and Tablets | Mobile devices that connect to networks via Wi-Fi or cellular |
| IoT Devices | Smart TVs, cameras, thermostats. Anything connected to the internet |
| Printers and Scanners | Peripheral devices shared over a network by multiple users |
| Security Cameras | Surveillance devices connected to the network |

## What are Communication Links?

Communication links are the pathways through which data travels between nodes. A communication link can be a wired link or a wireless link. The important point to note about a link is that this link only carries the information.

### Types of Links:

- **Wired Links:** Physical cables like Ethernet (twisted pair), Fiber optic, Coaxial cable
- **Wireless Links:** Radio waves (Wi-Fi), Infrared, Bluetooth, Satellite, Cellular (4G/5G)

## Purpose of a Computer Network

A computer network is mainly used for resource sharing. Networks save a lot of infrastructure cost.

| **Purpose** | **Description** |
| --- | --- |
| Resource Sharing | Multiple users can share one printer, one internet connection, or one storage server. Saving cost and increasing efficiency |
| Communication | Email, video calls, instant messaging. All made possible because computers are connected via networks |
| Centralized Management | Administrators can manage all computers from one place. Pushing updates, monitoring activity, enforcing policies |
| Data Storage and Backup | Centralized servers hold and back up data for all users on the network automatically |
| Cost Efficiency | Reduce operational and infrastructure costs through shared resources and centralized systems |
| Reliability and Availability | Improve system reliability using backup paths and fault tolerant mechanisms |
| Scalability and Growth | Support easy expansion by adding new devices and services as demand increases |
| Security and Control | Protect data and network resources using authentication, access control, and monitoring |
MD;
    }

    private static function lesson2(): string
    {
return <<<'MD'
# Basic Characteristics of a Network

A good computer network does not just connect devices. It must have specific qualities to be truly useful and reliable. There are four basic characteristics any computer network should possess: Fault tolerance, Scalability, Quality of Service (QoS), and Security.

## Fault Tolerance

**What it means:** The network should continue working even when one or more parts of it fail. Fault tolerance is the ability of the computer network to continue working despite failures and it should ensure there is no loss of service.

Imagine a city road system. If one road is blocked, cars re-route through another road and still reach the destination. A fault tolerant network does exactly this. Data finds another path when one route is broken.

- Achieved by having **redundant (backup) paths** between devices
- If a switch or router fails, traffic automatically reroutes through another device
- Protocols like **Spanning Tree Protocol (STP)** and **OSPF** help implement this

**Example:**
Suppose two entities are communicating through a path. If there is a failure in a link or a router goes down, the router forwards the data through an alternative path so that communication is not affected.

## Scalability

**What it means:** The network should be able to grow in size. Adding more devices and users without losing performance or requiring a complete redesign. It is the ability to grow based on the needs and have good performance even after growth.

- A school network that starts with 50 computers must be able to grow to 500 without replacing all equipment
- Cloud services like AWS and Google Cloud are prime examples of highly scalable networks
- Poor scalability leads to **bottlenecks** — points where the network slows down under load
- **The Internet is the best example of a scalable network.** Even at this moment, many new devices are connecting to the internet and communicating with each other. The Internet handles this perfectly and always gives scope for newcomers

## Quality of Service (QoS)

**What it means:** The ability of the network to prioritize certain types of traffic to ensure smooth performance for critical applications. It is the ability to set priorities and manage data traffic to reduce data loss and delays.

- A video call requires very low delay (latency). QoS can prioritize video packets over regular downloads
- Without QoS, all traffic is treated equally. Your video call may freeze while someone downloads a large file
- QoS mechanisms include **traffic shaping, prioritization queues, and bandwidth reservation**

**Example:**
Consider a router receiving email traffic and voice traffic (real time communication) simultaneously. The router will process voice over IP phone data first because it is real time communication. In real time communication, delays are not accepted, whereas a delay of one second in email communication does not hurt the communication. The router gives priority to real time communication over normal communication.

## Security (CIA Triad)

**What it means:** The ability to prevent unauthorized access, misuse, or forgery. Network security is built around three principles known as the **CIA Triad**.

| **Principle** | **Description** | **Implementation** |
| --- | --- | --- |
| Confidentiality | Only authorized people can read the data | Encryption (HTTPS, VPN) |
| Integrity | Data must not be altered during transmission | Checksums and hash functions (SHA-256) |
| Availability | Network resources must be accessible when needed | Protection against DDoS attacks and hardware failure |

### Cybersecurity Connection:

The CIA Triad is the backbone of every cybersecurity framework. When you hear about a data breach, ransomware, or DDoS attack — each one violates at least one part of the CIA Triad.
MD;
    }

    private static function lesson3(): string
    {
return <<<'MD'
# Data Communication Fundamentals

## Bits and Bytes: The Language of Computers

Computers and networks only work with binary digits, zeros and ones. Each bit can only have one of two possible values, 0 or 1. The term bit is an abbreviation of "binary digit" and represents the smallest piece of data. Humans interpret words and pictures, computers interpret only patterns of bits.

All data — photos, videos, text messages, passwords — is stored and transmitted as **binary numbers** (zeros and ones). Every input device (mouse, keyboard, voice activated receiver) translates human interaction into binary code. Every output device (printer, speakers, monitors) takes binary data and translates it back into human recognizable form.

| **Unit** | **Size** | **Example** |
| --- | --- | --- |
| 1 Bit | Smallest unit. 0 or 1 | On/Off signal |
| 1 Byte | 8 bits | One character like 'A' |
| 1 Kilobyte (KB) | 1,024 Bytes | A short text message |
| 1 Megabyte (MB) | 1,024 KB | A small photo |
| 1 Gigabyte (GB) | 1,024 MB | A full HD movie |
| 1 Terabyte (TB) | 1,024 GB | Thousands of movies |

### ASCII Code Example:

Computers use binary codes to represent and interpret letters, numbers and special characters. A commonly used code is the American Standard Code for Information Interchange (ASCII). With ASCII, each character is represented by eight bits.

- Capital letter: A = 01000001
- Number: 9 = 00111001
- Special character: # = 00100011

## Analog vs. Digital Signals

### Analog Signals
Continuous waves that vary smoothly over time. Like a human voice or radio waves. Susceptible to **noise and interference**. Old telephone systems used analog. All real life signals are analog in nature. The colors we see, the heat or temperature we feel, the sounds we produce or hear.

### Digital Signals
Discrete values — only 0s and 1s. Less affected by noise. Easier to store and process. Used in all modern computer networks and the Internet.

**Analogy:** Analog is like a dimmer light switch — it can be at any brightness level between off and fully on. Digital is like a regular on/off switch — it is either fully OFF (0) or fully ON (1). Computers prefer digital because it is clear and unambiguous.

## Transmission Methods

Data must be converted into signals that can be sent across the network media to its destination. Media refers to the physical medium on which the signals are transmitted. There are three common methods of signal transmission used in networks:

| **Method** | **Description** | **Advantages** | **Disadvantages** |
| --- | --- | --- | --- |
| Electrical (Copper Cables) | Data travels as electrical pulses through copper wire. Used in Ethernet cables | Cheap, easy to install | Limited distance (up to 100m) and speed, affected by EMI/RFI |
| Light (Fiber Optic) | Data travels as pulses of light through glass or plastic fibers | Extremely fast, long distances (up to 100,000m), immune to electromagnetic interference | Expensive, requires special installation skills |
| Wireless (Radio Waves) | Data travels as electromagnetic radio waves through the air. Used in Wi-Fi, Bluetooth, 4G/5G, satellite | Convenient, mobility | Affected by walls, interference, and distance, security concerns |

## Bandwidth vs. Throughput

| **Concept** | **Definition** | **Analogy** | **Measured In** |
| --- | --- | --- | --- |
| Bandwidth | Maximum possible data rate a connection can carry (theoretical max) | Width of a highway — how many cars CAN travel | Mbps, Gbps |
| Throughput | Actual data rate achieved in practice (real speed) | Actual cars traveling right now — affected by traffic jams | Mbps, Gbps |

**Important Note:** Your ISP says "100 Mbps bandwidth" but you often get 60 to 80 Mbps throughput. The difference is due to network congestion, protocol overhead, and hardware limitations.

Many factors influence throughput including:
- The amount of data being sent and received over the connection
- The types of data being transmitted
- The latency created by the number of network devices encountered between source and destination

In an internetwork or network with multiple segments, throughput cannot be faster than the slowest link of the path from sending device to the receiving device.

## Latency

**Latency** is the time it takes for a data packet to travel from the source to the destination. Also called **"ping" or delay**.

- Measured in **milliseconds (ms)**
- Low latency = fast response (good for gaming and video calls — ideally less than 50ms)
- High latency = slow response (bad user experience — 200ms+ feels sluggish)
- Causes of high latency: long physical distance, many router hops, network congestion

**Terminal: Measuring Latency**

```bash
$ ping google.com
PING google.com (142.250.80.46): 56 data bytes
64 bytes from 142.250.80.46: icmp_seq=0 ttl=117 time=12.4 ms
64 bytes from 142.250.80.46: icmp_seq=1 ttl=117 time=11.9 ms
64 bytes from 142.250.80.46: icmp_seq=2 ttl=117 time=12.1 ms

# 'time=12.4 ms' this is the latency (round trip time)
# Lower = faster = better network response
```
MD;
    }

    private static function lesson4(): string
    {
return <<<'MD'
# Data Flow Modes

When two devices communicate, the flow of data can happen in different ways. There are **three modes** of data flow: Simplex, Half Duplex, and Full Duplex.

## Simplex

Data flows in **only ONE direction**. From sender to receiver. The receiver can never send back. It is always a unidirectional communication.

### Real Examples:
- Keyboard to Computer (keyboard only sends, never receives)
- TV Broadcast (station sends, your TV only receives)
- Baby Monitor (one way audio transmission)
- Traditional monitors (not touch monitors)

## Half Duplex

Data flows in **both directions, but NOT at the same time**. Only one device can transmit at a time. You must wait for the other to finish before you respond.

### Real Examples:
- **Walkie Talkie:** "Over and out". You press to talk, release to listen. Both directions, but never simultaneously.
- Old Ethernet hubs and early wireless networks.

## Full Duplex

Data flows in **both directions SIMULTANEOUSLY**. Both devices can send and receive at the same time. The most efficient mode.

### Real Examples:
- **Phone Call / Video Call:** Both people can talk and listen at the same time.
- Modern Ethernet switches, mobile phones, modern Wi-Fi networks.
- Telephone Line.

## Final Comparison: Simplex vs Half Duplex vs Full Duplex

| **Mode** | **Direction** | **Simultaneous?** | **Example** |
| --- | --- | --- | --- |
| Simplex | One way only | No | Keyboard, TV Broadcast, Traditional Monitor |
| Half Duplex | Both ways, one at a time | No | Walkie Talkie, Old Ethernet |
| Full Duplex | Both ways, at the same time | Yes | Phone Call, Modern Ethernet, Telephone Line |
MD;
    }

    private static function lesson5(): string
    {
return <<<'MD'
# Types of Communication

When a device sends data on a network, it can address that data in different ways. To one specific device, to a group, or to everyone. These are called **communication types**.

## Unicast

**One to One** communication. Data is sent from one source to exactly one destination. Most network traffic is unicast. A unicast packet has a destination IP address that is a unicast address which goes to a single recipient.

**Example:** Visiting a website. Your computer requests data from ONE server, and that server responds to only YOUR computer.

**IPv4 unicast host addresses are in the address range:** 1.1.1.1 to 223.255.255.255. However, within this range are many addresses that are reserved for special purposes.

## Multicast

**One to Many (selective)** communication. Data is sent to a specific GROUP of devices that have subscribed to receive it. Multicast transmission reduces traffic by allowing a host to send a single packet to a selected set of hosts that subscribe to a multicast group.

**Example:** Live video streaming. The streaming server sends one stream to all viewers who have joined. Video conferencing, IPTV.

**IPv4 multicast address range:** 224.0.0.0 to 239.255.255.255.

## Broadcast

**One to All** communication. Data is sent to ALL devices on the network simultaneously.

**Example:** When your router assigns IP addresses using DHCP. It broadcasts to ask "Who needs an IP?" All devices hear it, only the right one responds. A broadcast packet has a destination IP address with all ones (1s) in the host portion, or 32 one (1) bits.

### Cybersecurity Note:
Attackers exploit **broadcast** traffic in attacks like ARP spoofing and DHCP starvation. Understanding these communication types helps you identify and defend against such attacks.

### Types of Broadcast:
- **Directed broadcast:** Sent to all hosts on a specific network. Example: 172.16.4.255
- **Limited broadcast:** Sent to 255.255.255.255. By default, routers do not forward broadcasts.

**Note:** IPv4 uses broadcast packets. However, there are no broadcast packets with IPv6. IPv6 replaces broadcast with multicast.

## Final Comparison: Unicast vs Multicast vs Broadcast

| **Type** | **Sender** | **Receivers** | **IP Address Example** |
| --- | --- | --- | --- |
| Unicast | 1 device | 1 specific device | 192.168.1.10 |
| Multicast | 1 device | Subscribed group | 224.0.0.1 (multicast range) |
| Broadcast | 1 device | All devices on subnet | 192.168.1.255 |
MD;
    }

    private static function lesson6(): string
    {
return <<<'MD'
# Network Architectures

Network architecture defines how computers are organized and how they interact with each other. The two fundamental models are **Client-Server** and **Peer-to-Peer (P2P)**.

## Client-Server Model

In this model, there is a clear division of roles: **Servers provide services**, and **Clients request those services**. It is also called a request-response model.

- The **server** is a powerful, dedicated machine that runs services 24/7 (web server, database, email server)
- The **client** is any device (laptop, phone, PC) that sends requests to the server
- All communication goes through the server. Clients do not communicate directly with each other

**Real Example:** You open **google.com** in your browser. Your browser is the CLIENT. It sends a request. Google's server is the SERVER. It processes your request and sends back the webpage.

| **Advantages** | **Disadvantages** |
| --- | --- |
| Centralized management | If the server goes down, all clients lose access |
| Better security | Server hardware is expensive |
| Easier to back up | Can become a bottleneck when many clients send requests simultaneously |
| Scalable | Requires network connectivity |
| Supports multiple clients simultaneously | Complex to scale properly (load balancing, replication, backups needed) |

### Types of Client-Server Architecture:
1. **2-Tier Architecture:** Client communicates directly with the server, which handles both processing and data storage.
2. **3-Tier Architecture:** Divided into presentation layer (client), application layer (business logic), and data layer (database server). Widely used in web applications and enterprise systems.

## Peer-to-Peer (P2P) Model

In P2P, **every device acts as BOTH a client AND a server**. There is no central authority. Peers connect directly to each other.

- Each peer can share files, resources, or services directly with other peers
- No single point of failure. If one peer goes offline, others continue
- Harder to secure and manage than client-server
- There is no centralized administration

**Real Examples:**
- **BitTorrent:** Each user downloading also uploads to others
- **Blockchain/Bitcoin:** All nodes store and validate transactions
- **Small home networks:** Two computers sharing files directly
- **Napster, Gnutella, eDonkey, Kazaa, Skype**

| **Advantages** | **Disadvantages** |
| --- | --- |
| Easy to set up | No centralized administration |
| Less complex | Not as secure |
| Lower cost (no dedicated servers needed) | Not scalable |
| Easy to add and remove nodes | Data is vulnerable because of no central server and backup |
| Less network traffic than client-server | Files hard to locate (not centrally stored) |

### Types of P2P Networks:
1. **Unstructured P2P Networks:** Easy to build but difficult to find content. Examples: Napster, Gnutella.
2. **Structured P2P Networks:** Not easy to set up but gives easy access to content. Examples: P-Grid, Kademlia.
3. **Hybrid P2P Networks:** Combines features of both P2P networks and client-server architecture. Uses a central server to find a node.

## Final Comparison: Client-Server vs Peer-to-Peer

| **Feature** | **Client-Server** | **Peer-to-Peer** |
| --- | --- | --- |
| Control | Centralized (server) | Decentralized (no center) |
| Security | Easier to secure | Harder to secure |
| Scalability | Scales with server upgrades | Scales naturally as peers join |
| Cost | High (dedicated servers needed) | Low (use existing hardware) |
| Used In | Websites, enterprise networks, email | BitTorrent, Blockchain, gaming, small home networks |
MD;
    }

    private static function lesson7(): string
    {
return <<<'MD'
# Network Types by Scale

Networks are categorized by their **physical size and geographic coverage**. The smaller the area, the faster and more controlled the network typically is.

## PAN: Personal Area Network

The smallest type of network, designed to connect devices within the immediate vicinity of an individual person.

| **Characteristic** | **Description** |
| --- | --- |
| Range | A few centimeters to approximately 10 meters |
| Technology | Bluetooth (IEEE 802.15.1), USB, NFC, Infrared, Zigbee, Z-Wave |
| Speed | Bluetooth 5.0: Up to 2 Mbps; NFC: Up to 424 Kbps; USB 3.0: Up to 5 Gbps |
| Examples | Connecting AirPods to your phone, smartwatch to phone, wireless keyboard to laptop, contactless payments |

### Advantages and Limitations of PAN

| **Advantages** | **Limitations** |
| --- | --- |
| Extremely low power consumption | Very limited range |
| Simple to set up and use | Low data rates compared to LAN/WAN |
| Low cost or no additional hardware required | Susceptible to interference in crowded 2.4 GHz band |
| Automatic device discovery and pairing | Limited number of simultaneous connections |

## LAN: Local Area Network

Connects computers and devices within a limited geographical area, typically a single building, floor, or small campus.

| **Characteristic** | **Description** |
| --- | --- |
| Range | Single building or campus. Up to approximately 1 km |
| Technology | Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11) |
| Speed | 100 Mbps (Fast Ethernet) to 10 Gbps (10 Gigabit Ethernet), with 25/40/100 Gbps in data centers |
| Examples | Home network, office network, school computer lab, coffee shop Wi-Fi |
| Key Devices | Switch, Router, Access Point, Network Interface Card (NIC) |
| Ownership | Private (owned and managed by the organization or individual) |
| Topology | Star (most common), Bus (legacy), Ring (legacy), Mesh (data centers) |

### Types of LAN:
- **Wired LAN:** Uses Ethernet cables (straight-through or crossover)
- **Wireless LAN (WLAN):** Uses Wi-Fi technology

## CAN: Campus Area Network

Connects multiple LANs within a defined geographical area, typically a university campus, corporate headquarters, or hospital complex.

| **Characteristic** | **Description** |
| --- | --- |
| Range | Multiple buildings on the same campus. Typically 1-5 km |
| Technology | Ethernet (fiber backbone), Fiber Optics, 10 Gigabit Ethernet, Wi-Fi (outdoor mesh) |
| Speed | Up to 1 Gbps to 100 Gbps on backbone links |
| Ownership | Single organization (university, corporation) |

## MAN: Metropolitan Area Network

Spans a city or large urban area, connecting multiple LANs and CANs across distances up to approximately 50 kilometers.

| **Characteristic** | **Description** |
| --- | --- |
| Range | A city or large urban area. Up to approximately 50 km |
| Technology | Fiber optic cables (SONET/SDH, DWDM), Metro Ethernet, MPLS, Microwave links |
| Speed | Up to 10 Gbps to 100 Gbps (with DWDM reaching multiple Tbps) |
| Examples | City-wide Wi-Fi networks, cable TV networks, bank branch networks, ISP metro networks |
| Ownership | Typically operated by telecom companies, ISPs, or city governments |

## WAN: Wide Area Network

Spans large geographical areas, connecting networks across countries, continents, and the globe.

| **Characteristic** | **Description** |
| --- | --- |
| Range | Countries and continents. Unlimited global coverage |
| Technology | Leased lines (T1/E1, T3/E3), MPLS, Satellite (GEO, MEO, LEO), Submarine fiber optic cables, SD-WAN |
| Speed | Varies widely from Kbps (satellite) to multiple Tbps (submarine cables) |
| Examples | The Internet (world's largest WAN), multinational company's global network |
| Ownership | ISPs, telecommunications carriers, consortiums |

## Final Comparison: PAN vs LAN vs CAN vs MAN vs WAN

| **Feature** | **LAN** | **CAN** | **MAN** | **WAN** |
| --- | --- | --- | --- | --- |
| Scope | Building | Campus | City | Global |
| Distance | <1 km | 1-5 km | 5-50 km | Unlimited |
| Speed | 100 Mbps-100 Gbps | 1-100 Gbps | 100 Mbps-100 Gbps | Varies widely |
| Latency | <1 ms | 1-5 ms | 5-20 ms | 20-500+ ms |
| Owner | Organization | Organization | ISP/Telecom | Multiple ISPs/Carriers |
| Cost | Low per port | Medium | High | Highest (per Mbps) |
| Security Control | Full | Full | Limited (carrier managed) | Minimal (public internet) |
MD;
    }

    private static function lesson8(): string
    {
return <<<'MD'
# Internet, Intranet, and Extranet

These three terms are often confused. They all describe networks, but with very different levels of access and purpose.

## Internet

The **global public network** that connects billions of devices worldwide. Anyone in the world can access public websites and services. Uses IP protocols.

The internet is not owned by any individual or group. The internet is a worldwide collection of interconnected networks (internetwork or internet for short), cooperating with each other to exchange information using common standards. Through telephone wires, fiber optic cables, wireless transmissions, and satellite links, internet users can exchange information in a variety of forms.

## Intranet

A **private, internal network** used within an organization. Uses the same web technologies (HTTP, HTML) as the Internet but is only accessible to employees.

| **Feature** | **Description** |
| --- | --- |
| Ownership | Owned and controlled by a single organization |
| Access | Restricted using login credentials |
| Purpose | Internal communication and collaboration |
| Uses | Employee portals, internal emails and messaging, sharing company policies and documents, internal applications (HR, payroll, project management) |
| Examples | Corporate internal website, university campus portal, government department internal systems |

## Extranet

An extension of the Intranet that is **partially accessible to authorized outsiders**. Like partners, suppliers, or customers. More restricted than Internet, less restricted than Intranet.

| **Feature** | **Description** |
| --- | --- |
| Access | Provided to partners, vendors, suppliers, or customers |
| Security | Requires authentication and authorization |
| Implementation | Often implemented using VPN or secure web access |
| Uses | Business-to-business (B2B) communication, supply chain management, customer portals, partner collaboration platforms |
| Examples | Supplier management system, online banking portals, vendor access portals |

## Final Comparison: Internet vs Intranet vs Extranet

| **Feature** | **Internet** | **Intranet** | **Extranet** |
| --- | --- | --- | --- |
| Access | Anyone worldwide | Internal employees only | Authorized external users |
| Security | Public (less secure) | High (private) | Medium (controlled access) |
| Authentication | Usually not required | Login required | Login + VPN or certificates |
| Example Use | Browsing websites | Company HR portal | Supplier portal, partner access |

**Analogy:** Think of a large hospital. The **Internet** is the public parking lot — anyone can enter. The **Intranet** is the staff area — only hospital employees with ID badges can enter. The **Extranet** is the special access area for approved vendors and insurance companies — outsiders, but with special permission.
MD;
    }

    private static function lesson9(): string
    {
return <<<'MD'
# Network Topologies

A **network topology** describes the physical or logical arrangement of devices and connections in a network. The topology you choose affects performance, cost, and fault tolerance.

Topology can be viewed as:
- **Physical topology:** Where devices are placed physically
- **Logical topology:** How data flows from one node to another

## Bus Topology

All devices are connected to a **single central cable** called the "bus" or "backbone." Data travels along this cable and every device receives it.

| **Aspect** | **Description** |
| --- | --- |
| Data Flow | Bidirectional (data can flow in both directions on the bus) |
| Advantages | Simple to set up, low cost, requires less cable, easy to connect or remove devices |
| Disadvantages | If the main cable breaks, the entire network fails. Difficult to troubleshoot. Performance degrades with more devices. No security |
| Used in | Old Ethernet networks (coaxial cable), legacy systems |

## Ring Topology

All devices are connected in a **closed loop (ring)**. Data travels in one direction around the ring, passing through each device until it reaches the destination.

| **Aspect** | **Description** |
| --- | --- |
| Data Flow | Unidirectional (data flows in one direction around the ring) |
| Communication Method | Uses a token. Whoever holds the token has the turn to send data (Token Ring) |
| Advantages | Equal access for all devices, easy to install, handles heavy traffic better than bus |
| Disadvantages | If one device or cable fails, the entire ring can break. Adding/removing devices disrupts the network |
| Used in | IBM Token Ring networks, SONET/SDH fiber backbone rings |

## Star Topology

All devices connect to a **central hub or switch**. All data passes through the central device. This is the most widely used topology today.

| **Aspect** | **Description** |
| --- | --- |
| Data Flow | All traffic must pass through the central hub or switch |
| Advantages | Easy to add/remove devices. One device failure does not affect the rest. Easy troubleshooting. Centralized administration. Scalable |
| Disadvantages | If the central hub/switch fails, the ENTIRE network goes down. Requires more cable. Bottlenecks possible |
| Used in | Almost all modern home and office Ethernet networks, Wi-Fi, school networks |

### Types of Star Topology:
- **Active Star Topology:** The central hub regenerates the signal. Works as a connector and boosts the signal.
- **Passive Star Topology:** The central hub simply connects devices but does not regenerate signals.

## Mesh Topology

In a mesh topology, **each device has a direct connection to multiple (or all) other devices**. This provides maximum redundancy.

### Full Mesh:
Every device is connected to every other device. **Maximum fault tolerance**.

**Formula for connections:** n(n-1)/2 where n = number of devices.

| **Aspect** | **Description** |
| --- | --- |
| Advantages | Highest fault tolerance, no single point of failure, multiple paths for data, very reliable |
| Disadvantages | Very expensive, complex to manage, impractical for large networks (1000+ computers) |
| Used in | Internet backbone routers, military networks, critical infrastructure |

### Partial Mesh:
Only **some devices** have multiple connections. Balances cost and redundancy. Used in most real-world networks.

## Hybrid Topology

A **combination of two or more topologies** in a single network. Most common in large real-world networks.

- Example: **Star topology in each department**, with switches connected in a **Ring or Mesh topology** at the core
- The Internet itself is a massive hybrid topology
- Provides the benefits of each individual topology while reducing their weaknesses

## Final Comparison: Bus vs Ring vs Star vs Mesh vs Hybrid

| **Topology** | **Fault Tolerance** | **Cost** | **Difficulty** | **Used In** |
| --- | --- | --- | --- | --- |
| Bus | Low | Low | Easy | Legacy systems |
| Ring | Medium | Medium | Medium | Token Ring, SONET |
| Star | Medium | Medium | Easy | Home/Office LAN |
| Full Mesh | Very High | Very High | Complex | Internet Backbone, Military |
| Partial Mesh | High | High | Complex | WAN, Enterprise core |
| Hybrid | High | Varies | Complex | Enterprise, Campus |

---

## Key Points: Quick Revision

- A computer network is two or more devices (nodes) connected by communication links to share data and resources.
- The four key network characteristics are: **Fault Tolerance, Scalability, QoS, and Security (CIA Triad)**.
- The CIA Triad stands for **Confidentiality, Integrity, and Availability**.
- Data is measured in bits and bytes: 1 Byte = 8 bits. Bit > Byte > KB > MB > GB > TB.
- **Bandwidth** = maximum capacity. **Throughput** = actual speed. **Latency** = delay (ms).
- Data flow modes: **Simplex** (one-way), **Half-Duplex** (both ways, one at a time), **Full-Duplex** (simultaneous).
- Communication types: **Unicast** (1-to-1), **Multicast** (1-to-group), **Broadcast** (1-to-all).
- Network architectures: **Client-Server** (centralized) and **P2P** (decentralized).
- Network sizes: PAN (<10m) > LAN (building) > CAN (campus) > MAN (city) > WAN (global).
- Internet = public. Intranet = private. Extranet = controlled external access.
- **Star topology** is most common. **Mesh** = highest fault tolerance. **Hybrid** = large enterprises.
MD;
    }

    private static function lesson10(): string
    {
return <<<'MD'
# Module 1 Quiz: Test Your Knowledge

Congratulations on completing Module 1: Introduction to Computer Networks! This quiz will test your understanding of all the key concepts covered in this module.

**Instructions:**
- There are 20 multiple-choice questions
- Each question has exactly one correct answer
- Review the Key Points from Lesson 9 before attempting
- You need at least 50% to pass
- You have 3 attempts

Good luck!
MD;
    }
}
