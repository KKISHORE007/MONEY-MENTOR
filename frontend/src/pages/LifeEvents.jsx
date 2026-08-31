import React, { useState } from 'react';
import { Heart, Baby, Gift, ArrowRight, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';
import '../styles/LifeEvents.css';

const LifeEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = [
    {
      id: 'marriage',
      title: 'Getting Married',
      icon: <Heart size={32} color="#ec4899" />,
      description: 'Align your finances as a couple.',
      advice: [
        { title: 'Joint Emergency Fund', desc: 'Combine your emergency funds to cover 6 months of joint expenses.', icon: <ShieldCheck /> },
        { title: 'Goal Alignment', desc: 'Discuss long-term goals like buying a house or retirement together.', icon: <TrendingUp /> },
        { title: 'Budgeting', desc: 'Create a new joint budget using the 50/30/20 rule.', icon: <DollarSign /> }
      ]
    },
    {
      id: 'child',
      title: 'New Child',
      icon: <Baby size={32} color="#06b6d4" />,
      description: 'Prepare for the newest family member.',
      advice: [
        { title: 'Education Fund', desc: 'Start an SIP early for higher education costs.', icon: <TrendingUp /> },
        { title: 'Term Insurance', desc: 'Increase your life cover to protect your child\'s future.', icon: <ShieldCheck /> },
        { title: 'Expense Shift', desc: 'Factor in new monthly costs for healthcare and essentials.', icon: <DollarSign /> }
      ]
    },
    {
      id: 'bonus',
      title: 'Bonus / Windfall',
      icon: <Gift size={32} color="#f59e0b" />,
      description: 'Make the most of your extra income.',
      advice: [
        { title: 'Debt Clearance', desc: 'Use 30-50% of the bonus to clear high-interest loans.', icon: <ArrowRight /> },
        { title: 'Lump Sum Investment', desc: 'Invest a portion in equity for long-term growth.', icon: <TrendingUp /> },
        { title: 'Splurge Smartly', desc: 'Set aside 10% for a well-deserved reward to stay motivated.', icon: <Heart /> }
      ]
    }
  ];

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Life Event Advisor</h1>
        <p>Expert financial guidance for life's biggest milestones</p>
      </div>

      <div className="events-selector">
        {events.map(event => (
          <div 
            key={event.id} 
            className={`event-option-card ${selectedEvent?.id === event.id ? 'active' : ''}`}
            onClick={() => setSelectedEvent(event)}
          >
            <div className="event-icon-box">{event.icon}</div>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="advice-section">
          <h3>Customized Plan for: {selectedEvent.title}</h3>
          <div className="advice-grid">
            {selectedEvent.advice.map((item, index) => (
              <div key={index} className="advice-card">
                <div className="advice-header">
                  {item.icon}
                  <h4>{item.title}</h4>
                </div>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="ai-cta">
            <p>Want a more detailed plan? Ask our AI Mentor about "{selectedEvent.title}"!</p>
            <button onClick={() => window.location.href = '/chat'}>Ask AI Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeEvents;

// minor safe update 19

// automated formatting update 19

// automated formatting update 44
