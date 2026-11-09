---
title: "Monitoring distributed systems"
description: "Strategies from Google's SRE experts for monitoring distributed systems well, from the value of white-box and black-box monitoring to the four golden signals of cloud infrastructure."
pubDate: 2023-12-06T21:20:25Z
tags: ["Cloud", "DevOps", "distributed-systems"]
image: /assets/Azure/monitoring-distribuited-systems.png
---

# Monitoring distributed systems

Today **distributed systems are the norm**, not the exception. Most modern applications are built on **microservices**, running in **containers**, running on **container orchestration clusters**, running in **the cloud**. The complexity of these distributed systems makes it hard to tell where the problem is when something goes wrong.

For an SRE, **observability is paramount**. Data **doesn't just power a great development experience; it also gives critical support to stakeholders**, offering essential metrics and valuable insights for business decisions.

![An Azure distributed system](/assets/Azure/architecture-telehealth-system.png)

Monitoring and alerting **let a system tell us when something is broken, or perhaps when it's about to break.**  
Monitoring a complex application **is a major engineering effort in itself**. Even with a significant monitoring infrastructure, it can be a very complex task.

When approaching monitoring in distributed systems, it's **crucial to set reasonable expectations**. That means recognizing the scope of what **monitoring can and should do, how alerts should be responded to, and what level of precision and complexity is manageable without overloading the people or the system**. The aim is to balance the need for detailed oversight with operational efficiency, so the team can focus on real problems and not false alarms. 

Monitoring **shouldn't become a Herculean task**; instead, **it should be a clever, well-orchestrated process**. In Google's SRE teams of 10 to 12 people, usually one or two are dedicated to building and maintaining monitoring systems.

In that sense, monitoring systems must be robust enough to alert on critical anomalies without falling into the trap of information overload, with complex dependency hierarchies or alerts based on automated "magic". The goal is to keep monitoring so simple and understandable that any team member can respond efficiently, from the first symptom to an in-depth root cause analysis. This is a core principle for sustaining an effective alerting system: maximize signal and minimize noise, making sure every alert is meaningful and every response calls for an intelligent, informed action.

## Symptoms vs causes

Our monitoring system should answer two questions: what's happening, and why is it happening?  

For example:

| Symptom    | Cause                      |
| ---------------- | ----------------------------- |
|   I'm returning 500s or 400s   | It turns out the database is refusing connections    |
| My responses are very slow  | The CPU is overloaded                   |

## White-box monitoring vs black-box monitoring

### White-box monitoring

This is **monitoring based on metrics exposed by the internals of the system**, including logs, interfaces such as the Java Virtual Machine Profiling Interface, or an HTTP handler that emits internal signals.

### Black-box monitoring

It focuses on **the external behaviour of the system**, **without considering how it works inside**. This approach is crucial for assessing the **end-user** experience and making sure the system meets its operational and business requirements.

Combining both approaches is vital for a **comprehensive monitoring strategy.** While white-box monitoring is **proactive and prevention-oriented,** black-box monitoring is reactive and centred on the **user experience.**

## The four golden signals

In its book [Site Reliability Engineering](https://landing.google.com/sre/sre-book/toc/), Google sets out **the four golden signals** of monitoring and **recommends focusing on these four parameters**:

### Latency

The time it takes to **process a request**. It's important to distinguish between successful requests and failed ones. For example, an **HTTP 500** error caused by a lost connection to a database or another backend may be processed quickly, but it's still a **sign of failure**. So including these errors in the overall latency can lead to **misleading conclusions**. A slow error is even worse than a fast one, which makes it vital to **track the latency of errors**.


### Traffic

It measures **how much demand is placed on the system**. For a web service, this usually means **HTTP requests per second**, broken down by type of request (static versus dynamic content). For other systems, such as audio streaming or key-value storage, traffic might be measured as **network I/O rate** or **transactions per second**.

### Errors

This metric **measures the rate of failed requests**. Errors can be explicit (such as **HTTP 500 errors**), implicit (for example, a successful HTTP 200 response with the wrong content) or defined by policy (for example, any request that exceeds a committed response time counts as an error). Monitoring errors takes a strategy that ranges from **detecting complete failures** at the load balancer to **end-to-end system tests** for subtler errors.

### Saturation

How **"full"** the service is. It focuses on the **system's most constrained resources** (for example memory in memory-constrained systems, or I/O in I/O-constrained ones). Saturation isn't only measured by current usage, but also by the **system's ability to handle growing load**. Latency is often an **early sign of saturation**, and measuring response times at high percentiles (such as the 99th) over short windows can give early warning of saturation. It's also important to predict **imminent saturation**, such as a hard drive that will be full in a few hours.

By monitoring these four golden signals and alerting the people in charge at any sign of a problem (or a potential problem, in the case of saturation), you get **adequate, effective monitoring coverage for the service**.


### **Worrying about the "tail" of requests: instrumentation and performance**

When building a monitoring system from scratch, it's tempting to design it around the mean of some quantity: mean latency, mean CPU usage of your nodes or mean fullness of your databases. The danger in the last two is obvious: CPUs and databases can be used very unevenly. The same goes for latency. If you run a web service with an average latency of 100 ms at 1,000 requests per second, 1% of requests could easily take 5 seconds. If your users depend on several of these web services to render their page, the 99th percentile of one backend can easily become the median response of your frontend.

The simplest way to tell a slow average from a very slow "tail" of requests is to collect request counts bucketed by latency (good for drawing a histogram), rather than actual latencies: how many requests did I serve that took between 0 ms and 10 ms, between 10 ms and 30 ms, between 30 ms and 100 ms, between 100 ms and 300 ms, and so on? Spacing the histogram boundaries roughly exponentially (in this case by factors of about 3) is often an easy way to visualize the distribution of your requests.

### Choosing the right monitoring resolution

Different aspects of a system should be measured at different levels of granularity. For example:

* Watching **CPU load** over a minute won't reveal long-lasting spikes that can cause high latency in the "tail" of requests.

* On the other hand, for a web service aiming for no more than **9 hours of downtime a year** (99.9% annual uptime), probing for a 200 status more than once or twice a minute is probably overkill.

* Likewise, checking hard drive fullness more than once every 1-2 minutes for a service targeting **99.9%** availability is probably unnecessary too.

Be careful about how you structure the granularity of your measurements. Collecting per-second CPU load can give interesting data, but such frequent measurements can be very expensive to collect, store and analyze. If your monitoring goal needs high resolution but not extremely low latency, you can cut these costs by sampling internally on the server and then setting up an external system to collect and aggregate that distribution over time or across servers. You could:

* Record the **current CPU utilization** every second.

* Using **buckets of 5% granularity**, increment the right CPU utilization bucket every second.

* Aggregate those values **every minute**.

This strategy lets you see brief CPU spikes without paying very high costs for collecting and keeping the data.

Piling up all these requirements can result in an extremely complex monitoring system. Your system could end up with these layers of complexity:

* **Alerts** on different latency thresholds, at different percentiles, on all kinds of different metrics.

* **Extra code** to detect and expose possible causes.

* **Associated dashboards** for each of these possible causes.

The sources of potential complexity are endless. Like any software system, monitoring can become so complex that it's fragile, hard to change and a maintenance burden.

So design your monitoring system with a focus on **simplicity**. When choosing what to monitor, keep these guidelines in mind:

* The rules that catch real incidents most often should be as **simple, predictable and reliable as possible**.

* Signals that are collected but not shown on any prebuilt dashboard or used by any alert should be removed, because they're not useful.

## Conclusion

A healthy monitoring and alerting pipeline is **simple and easy to understand**. It focuses mainly **on symptoms for paging**, keeping cause-oriented heuristics as aids for debugging. **Monitoring symptoms gets easier the further "up" your stack you monitor, although monitoring the saturation and performance of subsystems such as databases often has to be done directly on the subsystem itself**. **Email alerts have very limited value** and easily fill up with noise; instead, favour a **dashboard that tracks all ongoing subcritical problems, for the kind of information that usually ends up in email alerts**. A dashboard can also be paired with a log, to analyze historical correlations.

In the long run, a successful on-call rotation and product come from choosing to alert on symptoms or real imminent problems, adapting your targets to goals that are actually achievable, and making sure your monitoring supports fast diagnosis.
