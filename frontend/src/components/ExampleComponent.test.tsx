import { render, screen } from '@testing-library/react';
import ExampleComponent from './ExampleComponent';

describe('ExampleComponent Behavior', () => {

  // This is a high-value behavioral test. It verifies the component's primary logic.
  it('displays the conditional data section ONLY when a data prop is provided', () => {
    const testData = { key: 'value', nested: { id: 123 } };
    const testTitle = 'My Example';
    
    // First render: Render WITHOUT the data prop
    const { rerender } = render(<ExampleComponent title={testTitle} />);

    // Assert: The component renders its basic structure, but NO conditional data.
    expect(screen.getByText(testTitle)).toBeInTheDocument();
    expect(screen.queryByText('Conditional Data:')).not.toBeInTheDocument();
    
    // Second render: Rerender the SAME component WITH the data prop
    rerender(<ExampleComponent title={testTitle} data={testData} />);

    // Assert: NOW the conditional data section is visible.
    const conditionalDataHeading = screen.getByText('Conditional Data:');
    
    // Use a more flexible matcher for JSON content
    const conditionalDataContent = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && 
             content.includes('"key": "value"') && 
             content.includes('"nested"');
    });
    
    expect(conditionalDataHeading).toBeInTheDocument();
    expect(conditionalDataContent).toBeInTheDocument();
  });

  // Optional: A simple smoke test to ensure it doesn't crash on render.
  it('renders its title and static content without crashing', () => {
    render(<ExampleComponent title="Smoke Test Title" />);
    expect(screen.getByText('Smoke Test Title')).toBeInTheDocument();
    expect(screen.getByText('This is a simple, reusable component.')).toBeInTheDocument();
  });

});