import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import TaskList from '../pages/TaskList';
import * as taskApi from '../api/task';
import { useProjectStore } from '../store/projectStore';

// Mock dependencies
jest.mock('../api/task');
jest.mock('../store/projectStore');
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockTaskApi = taskApi as jest.Mocked<typeof taskApi>;
const mockUseProjectStore = useProjectStore as jest.MockedFunction<typeof useProjectStore>;

describe('TaskList Component', () => {
  const mockProject = {
    id: '1',
    name: 'Test Project',
    description: 'Test Description',
  };

  const mockTasks = [
    {
      id: '1',
      name: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      priority: 'high',
      start_date: '2024-01-01',
      end_date: '2024-01-10',
      progress: 0,
      project_id: '1',
    },
    {
      id: '2',
      name: 'Task 2',
      description: 'Description 2',
      status: 'in_progress',
      priority: 'medium',
      start_date: '2024-01-05',
      end_date: '2024-01-15',
      progress: 50,
      project_id: '1',
    },
  ];

  beforeEach(() => {
    mockUseProjectStore.mockReturnValue({
      currentProject: mockProject,
      setCurrentProject: jest.fn(),
    });
    mockTaskApi.getAll.mockResolvedValue(mockTasks);
    mockTaskApi.create.mockResolvedValue(mockTasks[0]);
    mockTaskApi.update.mockResolvedValue(mockTasks[0]);
    mockTaskApi.delete.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TaskList />
      </BrowserRouter>
    );
  };

  test('renders TaskList component', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('任务管理')).toBeInTheDocument();
    });
  });

  test('loads tasks on mount', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(mockTaskApi.getAll).toHaveBeenCalledWith({ project_id: '1' });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  test('opens modal when add button is clicked', async () => {
    renderComponent();
    
    const addButton = screen.getByText('新建任务');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('新建任务')).toBeInTheDocument();
    });
  });

  test('creates new task successfully', async () => {
    renderComponent();
    
    const addButton = screen.getByText('新建任务');
    fireEvent.click(addButton);
    
    // Fill form
    const nameInput = screen.getByLabelText('任务名称');
    fireEvent.change(nameInput, { target: { value: 'New Task' } });
    
    const submitButton = screen.getByText('确定');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockTaskApi.create).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('任务创建成功');
    });
  });

  test('updates task successfully', async () => {
    renderComponent();
    
    await waitFor(() => {
      const editButton = screen.getAllByText('编辑')[0];
      fireEvent.click(editButton);
    });
    
    const submitButton = screen.getByText('确定');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockTaskApi.update).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('任务更新成功');
    });
  });

  test('deletes task successfully', async () => {
    renderComponent();
    
    await waitFor(() => {
      const deleteButton = screen.getAllByText('删除')[0];
      fireEvent.click(deleteButton);
    });
    
    // Confirm deletion
    const confirmButton = screen.getByText('确定');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockTaskApi.delete).toHaveBeenCalledWith('1');
      expect(message.success).toHaveBeenCalledWith('任务删除成功');
    });
  });

  test('handles API errors gracefully', async () => {
    mockTaskApi.getAll.mockRejectedValue(new Error('API Error'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('加载任务失败');
    });
  });

  test('validates form fields before submission', async () => {
    renderComponent();
    
    const addButton = screen.getByText('新建任务');
    fireEvent.click(addButton);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('确定');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('请检查表单填写是否完整');
    });
  });

  test('filters tasks by status', async () => {
    renderComponent();
    
    await waitFor(() => {
      const statusFilter = screen.getByText('待处理');
      fireEvent.click(statusFilter);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });
  });

  test('sorts tasks by priority', async () => {
    renderComponent();
    
    await waitFor(() => {
      const sortButton = screen.getByText('优先级');
      fireEvent.click(sortButton);
    });
    
    await waitFor(() => {
      const tasks = screen.getAllByRole('row');
      expect(tasks[0]).toHaveTextContent('Task 1'); // High priority
      expect(tasks[1]).toHaveTextContent('Task 2'); // Medium priority
    });
  });
});
